# Form Engine Management

## Overview

This document outlines the form engine architecture, implementation standards, and best practices for MAIK-AI-CODING-APP. A robust form engine is essential for creating consistent, accessible, and maintainable forms throughout the application.

## Form Architecture

### Core Components

The form engine is composed of the following core components:

1. **Form Container**: Manages form state, validation, and submission
2. **Field Components**: Reusable UI controls with consistent behavior
3. **Validation Engine**: Handles validation rules and error messaging
4. **Form State Manager**: Controls form data and lifecycle events
5. **Field Adapter Layer**: Connects custom field types to the form engine

### Component Hierarchy

```
FormContainer
├── FormProvider (Context)
│   ├── FormState
│   ├── ValidationState
│   └── FormActions
├── FormSection
│   ├── FormField
│   │   ├── FieldLabel
│   │   ├── FieldControl
│   │   ├── FieldValidation
│   │   └── FieldHelperText
│   ├── FormField
│   └── FormField
└── FormActions
    ├── SubmitButton
    └── CancelButton
```

## Field Types

### Standard Fields

| Field Type | Component Name | Props | Usage |
|------------|---------------|-------|-------|
| Text Input | {{TEXT_FIELD_COMPONENT}} | {{TEXT_FIELD_PROPS}} | {{TEXT_FIELD_USAGE}} |
| Textarea | {{TEXTAREA_COMPONENT}} | {{TEXTAREA_PROPS}} | {{TEXTAREA_USAGE}} |
| Checkbox | {{CHECKBOX_COMPONENT}} | {{CHECKBOX_PROPS}} | {{CHECKBOX_USAGE}} |
| Radio Group | {{RADIO_COMPONENT}} | {{RADIO_PROPS}} | {{RADIO_USAGE}} |
| Select | {{SELECT_COMPONENT}} | {{SELECT_PROPS}} | {{SELECT_USAGE}} |
| Multi-select | {{MULTISELECT_COMPONENT}} | {{MULTISELECT_PROPS}} | {{MULTISELECT_USAGE}} |
| Date Picker | {{DATE_COMPONENT}} | {{DATE_PROPS}} | {{DATE_USAGE}} |
| File Upload | {{FILE_COMPONENT}} | {{FILE_PROPS}} | {{FILE_USAGE}} |

### Complex Fields

| Field Type | Component Name | Props | Usage |
|------------|---------------|-------|-------|
| Address | {{ADDRESS_COMPONENT}} | {{ADDRESS_PROPS}} | {{ADDRESS_USAGE}} |
| Phone Number | {{PHONE_COMPONENT}} | {{PHONE_PROPS}} | {{PHONE_USAGE}} |
| Rich Text Editor | {{RICH_TEXT_COMPONENT}} | {{RICH_TEXT_PROPS}} | {{RICH_TEXT_USAGE}} |
| Autocomplete | {{AUTOCOMPLETE_COMPONENT}} | {{AUTOCOMPLETE_PROPS}} | {{AUTOCOMPLETE_USAGE}} |
| Slider | {{SLIDER_COMPONENT}} | {{SLIDER_PROPS}} | {{SLIDER_USAGE}} |
| Rating | {{RATING_COMPONENT}} | {{RATING_PROPS}} | {{RATING_USAGE}} |

## Validation System

### Validation Rules

| Rule | Description | Parameters | Example |
|------|-------------|------------|---------|
| Required | Field must have a value | `message` | `{required: {message: 'This field is required'}}` |
| Min Length | Value must be at least N characters | `min`, `message` | `{minLength: {min: 8, message: 'Must be at least 8 characters'}}` |
| Max Length | Value must be at most N characters | `max`, `message` | `{maxLength: {max: 100, message: 'Must be at most 100 characters'}}` |
| Pattern | Value must match regex pattern | `pattern`, `message` | `{pattern: {pattern: /^[A-Z0-9]+$/, message: 'Only uppercase letters and numbers'}}` |
| Email | Value must be valid email | `message` | `{email: {message: 'Please enter a valid email address'}}` |
| URL | Value must be valid URL | `message` | `{url: {message: 'Please enter a valid URL'}}` |
| Number | Value must be a number | `message` | `{number: {message: 'Please enter a valid number'}}` |
| Min | Value must be at least N | `min`, `message` | `{min: {min: 5, message: 'Value must be at least 5'}}` |
| Max | Value must be at most N | `max`, `message` | `{max: {max: 100, message: 'Value must be at most 100'}}` |
| Custom | Custom validation function | `validate`, `message` | `{custom: {validate: (value) => isValid(value), message: 'Invalid value'}}` |

### Validation Triggers

- `onChange`: Validate when field value changes
- `onBlur`: Validate when field loses focus
- `onSubmit`: Validate when form is submitted
- `manual`: Validate only when explicitly triggered

### Custom Validation

Custom validation functions follow this signature:

```typescript
type ValidationFunction = (
  value: any,
  formValues: Record<string, any>,
  fieldProps: Record<string, any>
) => boolean | string | Promise<boolean | string>;
```

### Cross-Field Validation

Cross-field validation is implemented using the form context:

```jsx
// Example cross-field validation (pseudo-code)
const passwordsMatch = {
  custom: {
    validate: (value, formValues) => value === formValues.password,
    message: 'Passwords must match'
  }
};

<FormField
  name="confirmPassword"
  validation={passwordsMatch}
/>
```

## Form State Management

### Form Configuration

Forms are configured with the following options:

```jsx
// Example form configuration (pseudo-code)
<Form
  id="user-profile"
  initialValues={{
    firstName: '',
    lastName: '',
    email: ''
  }}
  validationMode="onBlur"
  onSubmit={handleSubmit}
  onChange={handleChange}
>
  {/* Form fields */}
</Form>
```

### Form Lifecycle Hooks

| Hook | Triggered When | Parameters | Usage |
|------|----------------|------------|-------|
| `onSubmit` | Form is submitted and valid | `values`, `form` | Handle form submission |
| `onChange` | Any field value changes | `values`, `changedField`, `form` | React to field changes |
| `onValidate` | Validation is performed | `errors`, `values`, `form` | Custom validation handling |
| `onReset` | Form is reset | `form` | Handle form reset |
| `onError` | Submission with validation errors | `errors`, `values`, `form` | Handle validation errors |

### Form State Interface

```typescript
interface FormState<T> {
  values: T;
  initialValues: T;
  touched: Record<keyof T, boolean>;
  errors: Record<keyof T, string | null>;
  dirty: boolean;
  valid: boolean;
  submitting: boolean;
  submitted: boolean;
  submitCount: number;
}
```

### Form Actions

```typescript
interface FormActions<T> {
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  setFieldError: (field: keyof T, error: string | null) => void;
  setValues: (values: Partial<T>) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => Promise<string | null>;
  validateForm: () => Promise<Record<keyof T, string | null>>;
  submitForm: () => Promise<void>;
}
```

## Field Customization

### Custom Field Creation

Custom fields should follow this pattern:

```jsx
// Example custom field (pseudo-code)
const CurrencyField = ({ name, label, ...props }) => {
  const { field, meta } = useField(name);
  
  const handleChange = (e) => {
    // Custom currency formatting logic
    const formattedValue = formatCurrency(e.target.value);
    field.onChange({
      target: {
        name,
        value: formattedValue
      }
    });
  };
  
  return (
    <FormField name={name} label={label}>
      <input
        {...field}
        {...props}
        onChange={handleChange}
        className={meta.error ? 'input-error' : 'input'}
      />
      {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}
    </FormField>
  );
};
```

### Field Adapters

For third-party components, create adapters:

```jsx
// Example field adapter (pseudo-code)
const ThirdPartyDatePickerAdapter = ({ name, ...props }) => {
  const { field, meta, helpers } = useField(name);
  
  return (
    <ThirdPartyDatePicker
      selected={field.value}
      onChange={(date) => helpers.setValue(date)}
      onBlur={field.onBlur}
      {...props}
    />
  );
};
```

## Form Layout and Styling

### Layout Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `FormSection` | Groups related fields | `title`, `description`, `columns` |
| `FormRow` | Horizontal layout for fields | `gap`, `alignment` |
| `FormGroup` | Logical grouping with label | `label`, `helperText` |
| `FormDivider` | Visual separation | `margin`, `label` |

### Responsive Behavior

Forms should be responsive following these guidelines:

- Single column layout on mobile devices
- Multi-column layout on tablet and desktop
- Appropriate input sizes for different field types
- Touch-friendly controls on mobile

### Styling Guidelines

- Consistent spacing between form elements
- Clear visual hierarchy of labels, inputs, and helper text
- Distinct styling for error states
- Focus states for accessibility
- Consistency with design system

## Form Submission

### Submission Process

1. User initiates form submission
2. Client-side validation is performed
3. If validation passes, `onSubmit` callback is invoked
4. Form enters submitting state
5. Submission result is handled

### Error Handling

- Validation errors displayed inline at field level
- Submission errors displayed at form level
- Network errors handled with appropriate messaging
- Form remains editable after error

### Success Handling

- Success feedback to user
- Form reset or redirect as appropriate
- Success state tracking

## Accessibility

### WCAG Compliance

All form components must meet WCAG 2.1 AA standards:

- Proper label associations with `for` attributes
- ARIA attributes for complex components
- Keyboard navigation support
- Focus management
- Error identification and suggestions
- Color contrast requirements

### Keyboard Navigation

- Tab navigation between fields
- Arrow key navigation within complex controls
- Enter/Space for selection and submission
- Escape for cancellation or closing dropdowns

### Screen Reader Support

- Meaningful labels and instructions
- Error announcements
- Status changes communicated via ARIA
- Descriptive button text

## Performance Considerations

### Form Rendering Optimization

- Memoization of form components
- Lazy validation for complex rules
- Virtualization for large forms
- Throttling of validation on input

### Large Form Strategies

- Form segmentation into steps/wizard
- Field grouping and progressive disclosure
- Asynchronous validation
- Partial form submission

## Form Schemas

### Schema Definition

Form schemas can be defined to generate forms dynamically:

```javascript
// Example form schema (pseudo-code)
const userProfileSchema = {
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      validation: { required: true },
      placeholder: 'Enter your first name'
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      validation: { required: true },
      placeholder: 'Enter your last name'
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      validation: { required: true, email: true },
      placeholder: 'Enter your email address'
    },
    {
      name: 'birthDate',
      type: 'date',
      label: 'Birth Date',
      validation: { required: true }
    }
  ],
  layout: {
    sections: [
      {
        title: 'Personal Information',
        fields: ['firstName', 'lastName', 'email', 'birthDate']
      }
    ]
  }
};
```

### Schema-Driven Forms

```jsx
// Example schema-driven form (pseudo-code)
<SchemaForm
  schema={userProfileSchema}
  initialValues={userData}
  onSubmit={handleSubmit}
/>
```

## Implementation Examples

### Basic Form Example

```jsx
// Example basic form implementation (pseudo-code)
function UserProfileForm({ user, onSubmit }) {
  return (
    <Form
      initialValues={{
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || ''
      }}
      onSubmit={onSubmit}
      validation={{
        firstName: { required: true },
        lastName: { required: true },
        email: { required: true, email: true }
      }}
    >
      <FormSection title="Personal Information">
        <FormRow>
          <TextField
            name="firstName"
            label="First Name"
            placeholder="Enter your first name"
          />
          <TextField
            name="lastName"
            label="Last Name"
            placeholder="Enter your last name"
          />
        </FormRow>
        <TextField
          name="email"
          label="Email Address"
          placeholder="Enter your email address"
        />
      </FormSection>
      
      <FormActions>
        <Button type="submit" variant="primary">Save Changes</Button>
        <Button type="button" variant="secondary">Cancel</Button>
      </FormActions>
    </Form>
  );
}
```

### Advanced Form Example

```jsx
// Example advanced form with custom validation (pseudo-code)
function RegistrationForm({ onRegister }) {
  const passwordValidator = {
    custom: {
      validate: (value) => {
        if (value.length < 8) return false;
        if (!/[A-Z]/.test(value)) return false;
        if (!/[0-9]/.test(value)) return false;
        if (!/[^A-Za-z0-9]/.test(value)) return false;
        return true;
      },
      message: 'Password must be at least 8 characters and include uppercase, number, and special character'
    }
  };

  const handleSubmit = async (values) => {
    try {
      await onRegister(values);
      // Handle success
    } catch (error) {
      // Handle error
      return {
        [error.field]: error.message
      };
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <TextField name="username" label="Username" validation={{ required: true }} />
      
      <PasswordField name="password" label="Password" validation={passwordValidator} />
      
      <PasswordField
        name="confirmPassword"
        label="Confirm Password"
        validation={{
          required: true,
          custom: {
            validate: (value, formValues) => value === formValues.password,
            message: 'Passwords must match'
          }
        }}
      />
      
      <CheckboxField
        name="termsAccepted"
        label="I agree to the Terms of Service"
        validation={{ required: true }}
      />
      
      <Button type="submit">Register</Button>
    </Form>
  );
}
```

## Best Practices

1. **Use Consistent Patterns**
   - Follow the same form structure across the application
   - Maintain consistent validation behavior
   - Use the same error messaging patterns

2. **Progressive Enhancement**
   - Ensure forms work without JavaScript
   - Add enhanced functionality when available
   - Provide fallbacks for complex controls

3. **Field Dependencies**
   - Clearly define field dependencies
   - Use conditional rendering for dependent fields
   - Maintain validation context when fields change

4. **Performance**
   - Avoid unnecessary re-renders
   - Optimize validation for large forms
   - Lazy load complex field components

5. **Maintainability**
   - Document custom field components
   - Create reusable validation rules
   - Test form components thoroughly

## References

- {{FORM_REFERENCE_1}}
- {{FORM_REFERENCE_2}}
- {{FORM_REFERENCE_3}}