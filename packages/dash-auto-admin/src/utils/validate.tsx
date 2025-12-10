import { JSX } from 'react';
import IDashAutoAdminAttribute from '../interfaces/IDashAutoAdminAttribute';

const validate =
	(schema: IDashAutoAdminAttribute[]) =>
	(values: { [field: string]: string | JSX.Element }) => {
		const errors: { [field: string]: string | JSX.Element } = {};
		schema.forEach((field) => {
			if (field.validate) {
				try {
					field.validate(values[field.attribute], values);
				} catch (error) {
					let message = 'Error';
					if (error instanceof Error) message = error.message;

					errors[field.attribute] = message;
				}
			}
		});

		return errors;
	};

export default validate;
