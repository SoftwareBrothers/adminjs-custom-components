import * as path from 'path'
import { ComponentLoader } from 'adminjs'

const dirname = __dirname

export const bundle = (
  componentLoader: ComponentLoader,
  componentName: string
): string => {
  componentLoader.add(
    componentName,
    path.join(dirname, `../src/components/${componentName}`)
  )

  return componentName
}
