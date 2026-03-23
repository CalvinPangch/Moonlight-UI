import { addons } from '@storybook/manager-api'
import { create } from '@storybook/theming'
import './nexus-manager.css'

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Moonlight Nexus',
    brandUrl: '/',
    appBg: '#07111d',
    appContentBg: '#0d1728',
    appPreviewBg: '#08111d',
    appBorderColor: 'rgba(148, 184, 255, 0.16)',
    appBorderRadius: 18,
    colorPrimary: '#7cb8ff',
    colorSecondary: '#9b7cff',
    textColor: '#eef4ff',
    textInverseColor: '#06111f',
    barTextColor: '#9db0d1',
    barSelectedColor: '#eef4ff',
    barBg: '#0b1626',
    inputBg: '#101d31',
    inputBorder: 'rgba(148, 184, 255, 0.16)',
    inputTextColor: '#eef4ff',
    fontBase: '"Outfit", "Plus Jakarta Sans", sans-serif',
    fontCode: '"IBM Plex Mono", monospace',
  }),
  panelPosition: 'right',
})
