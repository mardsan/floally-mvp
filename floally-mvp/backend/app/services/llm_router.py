"""
LLM Router Service
Intelligently routes requests to the best model based on task type, cost, and quality needs.
Provides fallback between Anthropic, OpenAI, and Google Gemini for redundancy.
"""
from typing import Optional, Dict, Any, Literal
import anthropic
import openai
import os
from datetime import datetime

# Import Gemini (optional - graceful degradation if not installed)
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("ℹ️ google-generativeai not installed - Gemini support disabled")

TaskType = Literal["fast", "reasoning", "strategic", "simple_generation"]


class LLMRouter:
    """
    Smart LLM routing with cost optimization and redundancy.
    
    Strategy:
    - Fast/high-volume tasks: Gemini Flash (50% cheaper than GPT-4o-mini!)
    - Reasoning tasks: Claude Sonnet 3.5 (best quality)
    - Strategic tasks: Claude Sonnet 3.5 or o1 (rare use)
    - Fallback: Switch provider if primary fails
    """
    
    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        
        # Initialize clients if keys available
        self.anthropic_client = anthropic.Anthropic(api_key=self.anthropic_key) if self.anthropic_key else None
        self.openai_client = openai.OpenAI(api_key=self.openai_key) if self.openai_key else None
        
        # Initialize Gemini if available
        if GEMINI_AVAILABLE and self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            self.gemini_available = True
        else:
            self.gemini_available = False
        
        # Track usage for monitoring
        self.usage_stats = {
            "anthropic_calls": 0,
            "openai_calls": 0,
            "gemini_calls": 0,
            "fallback_count": 0
        }
    
    def get_model_for_task(
        self, 
        task_type: TaskType,
        prefer_provider: Optional[Literal["anthropic", "openai", "gemini"]] = None
    ) -> Dict[str, Any]:
        """
        Get the best model configuration for a given task.
        
        Returns:
            {
                "provider": "anthropic" | "openai" | "gemini",
                "model": "model-name",
                "max_tokens": int,
                "temperature": float,
                "cost_estimate": float  # per 1M tokens
            }
        """
        
        # Task-specific configurations with Gemini as cheapest fast option
        configs = {
            "fast": {
                "primary": {
                    "provider": "gemini",
                    "model": "gemini-2.5-flash",  # Latest Gemini 2.5 (faster & better)
                    "max_tokens": 1000,
                    "temperature": 0.3,
                    "cost_per_1m_tokens": 0.075  # 50% cheaper than GPT-4o-mini!
                },
                "fallback": {
                    "provider": "openai",
                    "model": "gpt-4o-mini",
                    "max_tokens": 1000,
                    "temperature": 0.3,
                    "cost_per_1m_tokens": 0.15
                }
            },
            "reasoning": {
                "primary": {
                    "provider": "anthropic",
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 4000,
                    "temperature": 0.3,
                    "cost_per_1m_tokens": 3.0
                },
                "fallback": {
                    "provider": "openai",
                    "model": "gpt-4o",
                    "max_tokens": 4000,
                    "temperature": 0.3,
                    "cost_per_1m_tokens": 2.5
                }
            },
            "strategic": {
                "primary": {
                    "provider": "anthropic",
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 4000,
                    "temperature": 0.4,
                    "cost_per_1m_tokens": 3.0
                },
                "fallback": {
                    "provider": "openai",
                    "model": "gpt-4o",
                    "max_tokens": 4000,
                    "temperature": 0.4,
                    "cost_per_1m_tokens": 2.5
                }
            },
            "simple_generation": {
                "primary": {
                    "provider": "gemini",
                    "model": "gemini-2.5-flash",  # Latest Gemini 2.5 (faster & better)
                    "max_tokens": 1000,
                    "temperature": 0.7,
                    "cost_per_1m_tokens": 0.075  # Cheapest option!
                },
                "fallback": {
                    "provider": "openai",
                    "model": "gpt-4o-mini",
                    "max_tokens": 1000,
                    "temperature": 0.7,
                    "cost_per_1m_tokens": 0.15
                }
            }
        }
        
        task_config = configs.get(task_type, configs["reasoning"])
        
        # Use preferred provider if specified and available
        if prefer_provider:
            if prefer_provider == "gemini" and self.gemini_available:
                return task_config["primary"] if task_config["primary"]["provider"] == "gemini" else task_config["fallback"]
            elif prefer_provider == "anthropic" and self.anthropic_client:
                return task_config["primary"] if task_config["primary"]["provider"] == "anthropic" else task_config["fallback"]
            elif prefer_provider == "openai" and self.openai_client:
                return task_config["primary"] if task_config["primary"]["provider"] == "openai" else task_config["fallback"]
        
        # Default: use primary if available, otherwise fallback
        primary = task_config["primary"]
        fallback = task_config["fallback"]
        
        # Check primary provider availability
        if primary["provider"] == "gemini" and self.gemini_available:
            return primary
        elif primary["provider"] == "anthropic" and self.anthropic_client:
            return primary
        elif primary["provider"] == "openai" and self.openai_client:
            return primary
        
        # Try fallback providers
        if fallback["provider"] == "gemini" and self.gemini_available:
            self.usage_stats["fallback_count"] += 1
            return fallback
        elif fallback["provider"] == "anthropic" and self.anthropic_client:
            self.usage_stats["fallback_count"] += 1
            return fallback
        elif fallback["provider"] == "openai" and self.openai_client:
            self.usage_stats["fallback_count"] += 1
            return fallback
        else:
            raise ValueError(f"No LLM provider available for task type: {task_type}")
    
    async def complete(
        self,
        prompt: str,
        task_type: TaskType = "reasoning",
        system_prompt: Optional[str] = None,
        prefer_provider: Optional[Literal["anthropic", "openai", "gemini"]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Universal completion method that routes to the best model.
        
        Returns:
            {
                "text": str,
                "provider": str,
                "model": str,
                "tokens_used": int,
                "cost_estimate": float
            }
        """
        config = self.get_model_for_task(task_type, prefer_provider)
        provider = config["provider"]
        model = config["model"]
        
        # Override config with kwargs if provided
        max_tokens = kwargs.get("max_tokens", config["max_tokens"])
        temperature = kwargs.get("temperature", config["temperature"])
        
        try:
            if provider == "anthropic":
                return await self._anthropic_complete(
                    prompt=prompt,
                    model=model,
                    system_prompt=system_prompt,
                    max_tokens=max_tokens,
                    temperature=temperature
                )
            elif provider == "openai":
                return await self._openai_complete(
                    prompt=prompt,
                    model=model,
                    system_prompt=system_prompt,
                    max_tokens=max_tokens,
                    temperature=temperature
                )
            else:  # gemini
                return await self._gemini_complete(
                    prompt=prompt,
                    model=model,
                    system_prompt=system_prompt,
                    max_tokens=max_tokens,
                    temperature=temperature
                )
        except Exception as e:
            # Try fallback provider
            print(f"⚠️ {provider} failed, trying fallback: {e}")
            
            # Determine fallback provider (try others in order)
            fallback_order = ["gemini", "openai", "anthropic"]
            fallback_order.remove(provider)
            
            for fallback_provider in fallback_order:
                try:
                    fallback_config = self.get_model_for_task(task_type, prefer_provider=fallback_provider)
                    self.usage_stats["fallback_count"] += 1
                    
                    if fallback_provider == "anthropic":
                        return await self._anthropic_complete(
                            prompt=prompt,
                            model=fallback_config["model"],
                            system_prompt=system_prompt,
                            max_tokens=max_tokens,
                            temperature=temperature
                        )
                    elif fallback_provider == "openai":
                        return await self._openai_complete(
                            prompt=prompt,
                            model=fallback_config["model"],
                            system_prompt=system_prompt,
                            max_tokens=max_tokens,
                            temperature=temperature
                        )
                    else:  # gemini
                        return await self._gemini_complete(
                            prompt=prompt,
                            model=fallback_config["model"],
                            system_prompt=system_prompt,
                            max_tokens=max_tokens,
                            temperature=temperature
                        )
                except Exception as fallback_error:
                    print(f"⚠️ {fallback_provider} fallback also failed: {fallback_error}")
                    continue
            
            # All providers failed
            raise Exception(f"All LLM providers failed. Last error: {e}")
    
    async def _anthropic_complete(
        self,
        prompt: str,
        model: str,
        system_prompt: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> Dict[str, Any]:
        """Call Anthropic API"""
        messages = [{"role": "user", "content": prompt}]
        
        kwargs = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": messages
        }
        
        if system_prompt:
            kwargs["system"] = system_prompt
        
        response = self.anthropic_client.messages.create(**kwargs)
        
        self.usage_stats["anthropic_calls"] += 1
        
        text = response.content[0].text if response.content else ""
        
        return {
            "text": text,
            "provider": "anthropic",
            "model": model,
            "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
            "cost_estimate": self._calculate_anthropic_cost(
                model, 
                response.usage.input_tokens, 
                response.usage.output_tokens
            )
        }
    
    async def _openai_complete(
        self,
        prompt: str,
        model: str,
        system_prompt: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> Dict[str, Any]:
        """Call OpenAI API"""
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        response = self.openai_client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        self.usage_stats["openai_calls"] += 1
        
        text = response.choices[0].message.content
        
        return {
            "text": text,
            "provider": "openai",
            "model": model,
            "tokens_used": response.usage.total_tokens,
            "input_tokens": response.usage.prompt_tokens,
            "output_tokens": response.usage.completion_tokens,
            "cost_estimate": self._calculate_openai_cost(
                model,
                response.usage.prompt_tokens,
                response.usage.completion_tokens
            )
        }
    
    async def _gemini_complete(
        self,
        prompt: str,
        model: str,
        system_prompt: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> Dict[str, Any]:
        """Call Google Gemini API"""
        if not GEMINI_AVAILABLE or not self.gemini_available:
            raise Exception("Gemini not available")
        
        # Combine system prompt and user prompt for Gemini
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"
        
        gemini_model = genai.GenerativeModel(
            model_name=model,
            generation_config={
                "max_output_tokens": max_tokens,
                "temperature": temperature,
            }
        )
        
        response = gemini_model.generate_content(full_prompt)
        
        self.usage_stats["gemini_calls"] += 1
        
        text = response.text
        
        # Estimate token usage (Gemini doesn't always return usage metadata)
        input_tokens = len(full_prompt.split()) * 1.3  # Rough estimate
        output_tokens = len(text.split()) * 1.3
        
        return {
            "text": text,
            "provider": "gemini",
            "model": model,
            "tokens_used": int(input_tokens + output_tokens),
            "input_tokens": int(input_tokens),
            "output_tokens": int(output_tokens),
            "cost_estimate": self._calculate_gemini_cost(
                model,
                int(input_tokens),
                int(output_tokens)
            )
        }
    
    def _calculate_gemini_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost for Gemini models"""
        costs = {
            "gemini-1.5-flash": {"input": 0.075, "output": 0.30},
            "gemini-1.5-pro": {"input": 1.25, "output": 5.0},
            "gemini-2.0-flash-exp": {"input": 0.075, "output": 0.30}
        }
        
        model_cost = costs.get(model, costs["gemini-1.5-flash"])
        input_cost = (input_tokens / 1_000_000) * model_cost["input"]
        output_cost = (output_tokens / 1_000_000) * model_cost["output"]
        
        return input_cost + output_cost
    
    def _calculate_anthropic_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost for Anthropic models"""
        costs = {
            "claude-3-haiku-20240307": {"input": 0.25, "output": 1.25},
            "claude-3-5-sonnet-20241022": {"input": 3.0, "output": 15.0},
            "claude-3-opus-20240229": {"input": 15.0, "output": 75.0}
        }
        
        model_cost = costs.get(model, {"input": 3.0, "output": 15.0})
        return (input_tokens / 1_000_000 * model_cost["input"]) + (output_tokens / 1_000_000 * model_cost["output"])
    
    def _calculate_openai_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost for OpenAI models"""
        costs = {
            "gpt-4o-mini": {"input": 0.15, "output": 0.60},
            "gpt-4o": {"input": 2.5, "output": 10.0},
            "o1-preview": {"input": 15.0, "output": 60.0}
        }
        
        model_cost = costs.get(model, {"input": 2.5, "output": 10.0})
        return (input_tokens / 1_000_000 * model_cost["input"]) + (output_tokens / 1_000_000 * model_cost["output"])
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get usage statistics"""
        return {
            **self.usage_stats,
            "timestamp": datetime.now().isoformat(),
            "anthropic_available": bool(self.anthropic_client),
            "openai_available": bool(self.openai_client)
        }


# Global router instance
_router = None

def get_llm_router() -> LLMRouter:
    """Get singleton LLM router instance"""
    global _router
    if _router is None:
        _router = LLMRouter()
    return _router
