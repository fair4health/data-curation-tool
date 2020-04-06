import Vue from 'vue'

interface Notifier {
  success (message: string): void
  error (message: string): void
  info (message: string): void
  warning (message: string): void
}

declare module 'vue/types/vue' {
  interface Vue {
    $notify: Notifier
  }
}
