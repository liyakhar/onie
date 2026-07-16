import { createServerFn } from '@tanstack/react-start'

function publicValue(key: string) {
  return process.env[key]?.trim() || 'Not configured for launch'
}

export const getLegalIdentity = createServerFn({ method: 'GET' }).handler(async () => ({
  businessName: publicValue('LEGAL_BUSINESS_NAME'),
  businessForm: publicValue('LEGAL_BUSINESS_FORM'),
  businessAddress: publicValue('LEGAL_BUSINESS_ADDRESS'),
  registrationNumber: publicValue('LEGAL_REGISTRATION_NUMBER'),
  contactEmail: publicValue('LEGAL_CONTACT_EMAIL'),
  contactPhone: publicValue('LEGAL_CONTACT_PHONE'),
  publicationDirector: publicValue('LEGAL_PUBLICATION_DIRECTOR'),
  hostName: publicValue('LEGAL_HOST_NAME'),
  hostAddress: publicValue('LEGAL_HOST_ADDRESS'),
  mediatorName: publicValue('CONSUMER_MEDIATOR_NAME'),
  mediatorUrl: publicValue('CONSUMER_MEDIATOR_URL'),
}))
