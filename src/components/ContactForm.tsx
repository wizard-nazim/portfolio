'use client'
import { useForm, ValidationError } from '@formspree/react'

export default function ContactForm() {
  const [state, handleSubmit] = useForm('mvzyypjp')

  if (state.succeeded) {
    return (
      <div className="contact-form">
        <div className="cf-success">
          <span className="cf-success-stamp">Message sent ✦</span>
          <p className="cf-success-note">
            Thanks — I&apos;ll get back to you at nazim.dev@proton.me
          </p>
        </div>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="cf-title">Send a message</div>

      <div className="f-row">
        <div className="form-field">
          <label className="form-label" htmlFor="name">Name</label>
          <input
            id="name"
            className="form-input"
            type="text"
            name="name"
            placeholder="Your name"
            required
          />
          <ValidationError field="name" prefix="Name" errors={state.errors}
            className="cf-field-error" />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="form-input"
            type="email"
            name="email"
            placeholder="your@email.com"
            required
          />
          <ValidationError field="email" prefix="Email" errors={state.errors}
            className="cf-field-error" />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="subject">What&apos;s this about?</label>
        <input
          id="subject"
          className="form-input"
          type="text"
          name="subject"
          placeholder="Collab, commission, just saying hi..."
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="message">Message</label>
        <textarea
          id="message"
          className="form-textarea"
          name="message"
          placeholder="Tell me more..."
          required
        />
        <ValidationError field="message" prefix="Message" errors={state.errors}
          className="cf-field-error" />
      </div>

      <ValidationError errors={state.errors} className="cf-form-error" />

      <button
        className="form-submit"
        type="submit"
        disabled={state.submitting}
      >
        {state.submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
