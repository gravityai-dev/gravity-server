/**
 * Form Publisher - Publisher for dynamic form structures
 * 
 * This publisher accepts form configurations with steps, inputs, and validation rules.
 * The client renders these as interactive multi-step forms with various input types.
 */

import { BasePublisher, PublishOptions } from "./base";
import type { BaseMessage } from "../types";
import { Publisher } from "../Publisher";

// Form input types supported by the client (matching FormBuilder tool spec)
export type FormInputType = 
  | "text" 
  | "phone" 
  | "email" 
  | "date" 
  | "number" 
  | "password" 
  | "url" 
  | "textarea" 
  | "boolean" 
  | "select";

// Language codes supported by the form builder
export type FormLanguage = "ar" | "en";

export interface FormInputOption {
  label: string;
  value: string;
}

export interface FormInput {
  description: string;
  value: string | boolean; // Support both string and boolean values
  inputType: FormInputType;
  required?: boolean; // Optional with default true
  options: FormInputOption[]; // Required array (can be empty)
  placeholder?: string; // Optional field for UI enhancement
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormStep {
  stepId: string;
  title: string;
  description?: string; // Optional in the schema
  inputs: FormInput[];
  nextStep?: string; // Optional for last step
  previousStep?: string; // Optional for first step
}

export interface FormStructure {
  lang: FormLanguage; // Must be "ar" or "en"
  steps: FormStep[];
}

export interface Form extends BaseMessage {
  __typename: "Form";
  component: {
    type: "form";
    props: any; // Accept any form structure for flexibility
  };
}

export class FormPublisher extends BasePublisher {
  /**
   * Publish a form structure
   * @param formData - Form configuration with steps and inputs
   * @param baseMessage - Base message properties
   * @param options - Optional publishing options (e.g., custom channel)
   */
  async publishForm(
    formData: FormStructure,
    baseMessage: Partial<BaseMessage>,
    options?: PublishOptions
  ): Promise<void> {
    const message: Form = {
      ...this.createBaseMessage(baseMessage),
      __typename: "Form",
      component: {
        type: "form",
        props: formData, // Pass through the form structure directly
      },
    };

    await this.publish(message as any, options);
  }


}

// Singleton instance for performance
let formPublisherInstance: FormPublisher | null = null;

/**
 * Get singleton FormPublisher instance
 * Maximum performance - no new objects created after first call
 * 
 * @param host - Redis host (required on first call)
 * @param port - Redis port (required on first call)
 * @param password - Redis password (required on first call)
 * @param providerId - Provider ID (required on first call)
 * @param username - Redis username (optional)
 * @param db - Redis database number (optional)
 * @returns Singleton FormPublisher instance
 */
export function getFormPublisher(
  host?: string, 
  port?: number, 
  password?: string, 
  providerId?: string, 
  username?: string, 
  db?: number
): FormPublisher {
  if (!formPublisherInstance) {
    if (!host || !port || password === undefined || !providerId) {
      throw new Error('FormPublisher requires host, port, password, and providerId on first call');
    }
    
    const publisher = Publisher.fromConfig(host, port, password, providerId, username, db);
    formPublisherInstance = new FormPublisher(
      publisher.getRedisConnection(),
      publisher.getProviderId()
    );
  }

  return formPublisherInstance;
}
