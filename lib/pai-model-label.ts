import { getModelDisplayName } from "@/components/MessageView";

/**
 * The model label for PAI's own surfaces.
 *
 * `getModelDisplayName` resolves a configured model to its friendly name and
 * otherwise falls back to `provider/model`. That fallback is reached whenever
 * the recorded provider no longer matches the config — renaming a provider is
 * enough, because a message records the provider it actually ran under and is
 * never rewritten.
 *
 * The fallback is kept, because "this model is not in your config" is worth
 * seeing. Only its separator changes, so that an unresolved label reads the
 * same way as the model button does rather than switching to a slash.
 *
 * `getModelDisplayName` itself is left alone: upstream's own test pins its
 * fallback to `gateway/unknown-model` exactly.
 */
export function paiModelLabel(
  provider: string,
  model: string,
  modelNames?: Record<string, string>,
): string {
  const resolved = getModelDisplayName(provider, model, modelNames);
  return resolved === `${provider}/${model}` ? `${provider} • ${model}` : resolved;
}
