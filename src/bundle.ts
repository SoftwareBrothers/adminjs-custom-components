import AdminBro from 'adminjs'

export const bundle = (componentName: string): string => {
  return AdminBro.bundle(`../src/components/${componentName}`)
}
