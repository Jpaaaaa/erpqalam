import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { isValidUsername } from '../username.util';

export function IsUsername(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isUsername',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isValidUsername(value);
        },
        defaultMessage() {
          return 'Username must be 3–30 characters and contain only letters, numbers, dots, and underscores';
        },
      },
    });
  };
}
