import AdminJs from 'adminjs'

export const bundle = (componentName: string): string => {
  return AdminJs.bundle(`../src/components/${componentName}`)
}
