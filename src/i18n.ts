import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

// Load all locales and remember context
const loadMessages = () => {
  const context = require.context('./locales', true, /[a-z0-9-_]+\.json$/i)

  const messages = context
    .keys()
    .map((key) => ({ key, locale: key.match(/[a-z0-9-_]+/i)[0] }))
    .reduce(
      (messages, { key, locale }) => ({
        ...messages,
        [locale]: context(key),
      }),
      {}
    )

  return { context, messages }
}

const { context, messages } = loadMessages()

// VueI18n instance
const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  silentFallbackWarn: true
})

// Hot updates
if (module.hot) {
  module.hot.accept(context.id, () => {
    const { messages: newMessages } = loadMessages()

    Object.keys(newMessages)
      .filter((locale) => messages[locale] !== newMessages[locale])
      .forEach((locale) => {
        messages[locale] = newMessages[locale]
        i18n.setLocaleMessage(locale, messages[locale])
      })
  })
}

export default i18n
