// ─── PUNTO DE ENTRADA DE @pendulo/ui ─────────────────────────────────────────
//
// 9 componentes públicos según el orden del brief:
//   1. EquationBlock              — KaTeX bloque/inline + anotación
//   2. DataReadout                — fila clave/valor estilo simulador
//   3. ParameterSlider            — slider controlado con tinte por color
//   4. SectionShell               — wrapper de sección con data-attrs para IO
//   5. ProgressRail               — barra vertical de progreso scrolleable
//   6. NumericExercise            — input numérico + validación contra API
//   7. MultipleChoiceExercise     — opciones radio + validación
//   8. OpenExercise               — textarea libre, registra intento
//   9. PendulumStage              — SVG sticky que se arma pieza por pieza

export { EquationBlock }                        from './EquationBlock'
export type { EquationBlockProps }              from './EquationBlock'

export { DataReadout }                          from './DataReadout'
export type { DataReadoutProps, AccentColor as DataReadoutColor } from './DataReadout'

export { ParameterSlider }                      from './ParameterSlider'
export type { ParameterSliderProps }            from './ParameterSlider'

export { SectionShell }                         from './SectionShell'
export type { SectionShellProps }               from './SectionShell'

export { ProgressRail }                         from './ProgressRail'
export type { ProgressRailProps, ProgressRailSection } from './ProgressRail'

export { NumericExercise }                      from './NumericExercise'
export type { NumericExerciseProps }            from './NumericExercise'

export { MultipleChoiceExercise }               from './MultipleChoiceExercise'
export type { MultipleChoiceExerciseProps }     from './MultipleChoiceExercise'

export { OpenExercise }                         from './OpenExercise'
export type { OpenExerciseProps }               from './OpenExercise'

export { PendulumStage, PIECE_ORDER }           from './PendulumStage'
export type { PendulumStageProps, PendulumStageSlug } from './PendulumStage'

export const UI_PACKAGE_VERSION = '0.1.0' as const
