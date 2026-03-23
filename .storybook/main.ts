import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.server = config.server ?? {}
    config.server.fs = config.server.fs ?? {}
    config.server.fs.allow = [...(config.server.fs.allow ?? []), '..']
    return config
  },
}

export default config
