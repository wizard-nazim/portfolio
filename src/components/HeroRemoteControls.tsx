'use client'

import type { ModelVariant } from './HeroScene'

type ModelOption = { id: ModelVariant; label: string }
type BackgroundOption = { id: string; label: string; src: string }

type Props = {
  models: ModelOption[]
  modelVariant: ModelVariant
  onModelChange: (variant: ModelVariant) => void
  backgrounds: BackgroundOption[]
  backgroundId: string
  onBackgroundChange: (id: string) => void
  onNextChannel: () => void
}

// ── Hero remote — lets visitors swap the 3D model, the background, and skip ──
// to the next channel, like a TV remote for the hero scene.
export default function HeroRemoteControls({
  models,
  modelVariant,
  onModelChange,
  backgrounds,
  backgroundId,
  onBackgroundChange,
  onNextChannel,
}: Props) {
  return (
    <div className="hero-remote">
      <label className="hero-remote-field">
        <span>Model</span>
        <select
          value={modelVariant}
          onChange={(e) => onModelChange(e.target.value as ModelVariant)}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </label>

      <label className="hero-remote-field">
        <span>Background</span>
        <select
          value={backgroundId}
          onChange={(e) => onBackgroundChange(e.target.value)}
        >
          {backgrounds.map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      </label>

      <button type="button" className="hero-remote-btn" onClick={onNextChannel}>
        Next Channel ▸▸
      </button>
    </div>
  )
}
