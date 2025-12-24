# object-decoder

A lightweight, type-safe schema validation and parsing library for TypeScript.

## Installation

```bash
npm install object-decoder
# or
pnpm add object-decoder
# or
yarn add object-decoder
```

## Usage

### Basic Usage

Import the parsers you need and define a schema.

```typescript
import { object, string, number } from 'object-decoder';

const userSchema = object({
  id: number(),
  name: string(),
  email: string(),
});

const data = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
};

const user = userSchema.parse(data);
console.log(user);
```

### Type Inference

You can infer the TypeScript type from your schema using the `$Infer` type.

```typescript
import { object, string, number, type $Infer } from 'object-decoder';

const userSchema = object({
  id: number(),
  name: string(),
});

type User = $Infer<typeof userSchema>;
// type User = {
//   id: number;
//   name: string;
// }
```

### Object Extension and Omission

You can extend existing object schemas or exclude fields from them.

#### Extending Objects

Use `.extend()` to combine two object schemas.

```typescript
import { object, string, number } from 'object-decoder';

const baseUser = object({
  id: number(),
});

const detailedUser = baseUser.extend(object({
  name: string(),
  email: string(),
}));

// detailedUser expects id, name, and email
```

#### Omitting Fields

Use `.exclude()` to remove fields from an object schema.

```typescript
import { object, string, number } from 'object-decoder';

const userSchema = object({
  id: number(),
  name: string(),
  password: string(),
});

const publicUserSchema = userSchema.exclude('password');

// publicUserSchema expects id and name
```

### Constructing Models

The library provides various parsers to construct complex data models.

#### Primitives

```typescript
import { string, number, boolean } from 'object-decoder';

const myString = string();
const myNumber = number();
const myBoolean = boolean();
```

#### Arrays

```typescript
import { array, string } from 'object-decoder';

const tags = array(string());
```

#### Optional Fields

```typescript
import { object, string, optional } from 'object-decoder';

const schema = object({
  required: string(),
  optional: optional(string()),
});
```

#### Unions

```typescript
import { union, string, number } from 'object-decoder';

const id = union([string(), number()]);
```

#### Enums

```typescript
import { enumerate } from 'object-decoder';

enum Role {
  Admin = 'ADMIN',
  User = 'USER',
}

const roleSchema = enumerate(Role);
```

#### Object Options

You can configure object parsers to disallow unknown fields.

```typescript
import { object, string } from 'object-decoder';

const strictSchema = object({
  name: string(),
}, { disallowUnknownFields: true });
```

## API Reference

### `.parse(input: unknown): T`

Parses the input and returns the typed data. Throws an error if validation fails.

### `.safeParse(input: unknown): Result<T>`

Parses the input and returns a result object.

```typescript
const result = schema.safeParse(input);
if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

