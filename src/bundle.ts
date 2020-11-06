import AdminBro from 'admin-bro';

export const bundle = (componentName: string): string => {
  return AdminBro.bundle(`../src/components/${componentName}`);
};
