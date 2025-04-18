# Gemini API Integration Notes

## Overview

This document outlines the implementation details and technical considerations for integrating Google's Gemini API into the MAIK IDE. It addresses specific challenges related to the tool/function calling format that differs from other AI providers.

## Implementation Details

### 1. Tool/Function Calling Format

Gemini API requires a specific format for tool calling that differs from OpenAI and Anthropic:

#### Our Common AITool Format
```typescript
interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}
```

#### Gemini Expected Format
Gemini expects tools to be provided in this structure:
```typescript
[{
  functionDeclarations: [
    {
      name: string;
      description: string;
      parameters: {
        type: SchemaType.OBJECT;
        properties: Record<string, any>;
        required: string[];
      }
    }
  ]
}]
```

### 2. Key Differences

1. **Structure**: Gemini uses a `functionDeclarations` array inside a tools array instead of directly passing functions
2. **Schema Type**: Gemini uses enum values from `SchemaType` for type definitions
3. **Parameters Format**: The parameters object requires specific schema formats

### 3. Solution Implemented

To solve this integration issue, we implemented a converter function that transforms our common AITool format into Gemini's expected format:

```typescript
private convertToolsToGeminiFormat(tools: AITool[]): GeminiTool[] {
  // Gemini expects a single tool object with an array of function declarations
  return [{
    functionDeclarations: tools.map(tool => ({
      name: tool.function.name,
      description: tool.function.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: tool.function.parameters.properties || {},
        required: tool.function.parameters.required || []
      }
    }))
  }];
}
```

### 4. Response Processing

The function call response format from Gemini also differs from other providers:

#### OpenAI Format
```typescript
{
  message: {
    content: string;
    tool_calls: [{
      id: string;
      type: 'function';
      function: {
        name: string;
        arguments: string; // JSON string
      }
    }]
  }
}
```

#### Gemini Format
Gemini returns function calls that can be accessed via `result.response.functionCalls()` which returns:
```typescript
{
  name: string;
  args: Record<string, any>; // Already parsed object, not a string
}
```

Our implementation normalizes this response to match our common format:
```typescript
if (functionCalls && functionCalls.length > 0) {
  return {
    message: {
      content: result.response.text(),
      tool_calls: functionCalls.map(fc => ({
        id: `call-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: 'function',
        function: {
          name: fc.name,
          arguments: JSON.stringify(fc.args) // Convert to JSON string to match common format
        }
      }))
    }
  };
}
```

## Testing Notes

When testing tool calling with Gemini:

1. Verify that the tools are properly converted to Gemini's format
2. Check that function calls are correctly extracted from the response
3. Ensure the response is normalized to our common format expected by the rest of the application

## Future Considerations

1. **Version Compatibility**: Monitor Gemini API version updates for any changes to tool/function calling format
2. **Model Support**: Not all Gemini models support function calling (e.g., gemini-1.0-pro-vision does not)
3. **Function Arguments Format**: Maintain compatibility with the common function argument format across providers

## References

- [Google Generative AI SDK Documentation](https://ai.google.dev/docs)
- [Gemini Function Calling Documentation](https://ai.google.dev/docs/function_calling)
- [Anthropic Function Calling Documentation](https://docs.anthropic.com/claude/docs/functions-external-tools)
- [OpenAI Function Calling Documentation](https://platform.openai.com/docs/guides/function-calling)