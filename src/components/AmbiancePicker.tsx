import { useMessages } from '../i18n/messages'
import { PALETTES } from '../scenes/palettes'
import { SCENES } from '../scenes/scenes'
import { WEATHERS } from '../scenes/weather'
import { useAmbianceStore } from '../store/ambianceStore'
import { Segmented } from './Segmented'

const SWATCH = 'h-7 w-7 rounded-full ring-white ring-offset-2 ring-offset-night transition-shadow aria-pressed:ring-2'

export function AmbiancePicker() {
  const { sceneId, paletteId, weatherId, setScene, setPalette, setWeather } = useAmbianceStore()
  const t = useMessages().ambiance

  return (
    <div className="space-y-3">
      <Segmented
        label={t.scene}
        options={SCENES.map(({ id }) => ({ id, label: t.scenes[id] }))}
        value={sceneId}
        onChange={setScene}
      />

      <Segmented
        label={t.weather}
        options={WEATHERS.map((id) => ({ id, label: t.weathers[id] }))}
        value={weatherId}
        onChange={setWeather}
      />

      <div className="flex gap-2" role="group" aria-label={t.timeOfDay}>
        {PALETTES.map((palette) => (
          <button
            key={palette.id}
            type="button"
            onClick={() => setPalette(palette.id)}
            aria-label={t.palettes[palette.id]}
            title={t.palettes[palette.id]}
            aria-pressed={palette.id === paletteId}
            className={SWATCH}
            style={{ background: `linear-gradient(${palette.skyTop}, ${palette.skyBottom})` }}
          />
        ))}
        <button
          type="button"
          onClick={() => setPalette('auto')}
          aria-label={t.auto}
          title={t.auto}
          aria-pressed={paletteId === 'auto'}
          className={SWATCH}
          style={{ background: `linear-gradient(90deg, ${PALETTES.map((palette) => palette.skyBottom).join(', ')})` }}
        />
      </div>
    </div>
  )
}
