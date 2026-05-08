import { useState } from "react";

// A reusable form hook that works with any object shape (T)
// T must be an object where keys are strings and values can be anything
export function useForm<T extends Record<string, any>>(initial: T) {
  // Store form values using React state
  const [values, setValues] = useState<T>(initial);

  // Handle input changes for <input>, <textarea>, and <select> elements
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Update the specific field in the form state
    setValues({ ...values, [name]: value });
  };

  // Return form values and the change handler
  return [values, handleChange] as const; // 'as const' keeps the tuple structure
}