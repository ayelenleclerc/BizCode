# SaasRegisterInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaasRegisterInput.schema.json](../schema-json/SaasRegisterInput.schema.json "open original schema") |

## SaasRegisterInput Type

`object` ([SaasRegisterInput](saasregisterinput.md))

# SaasRegisterInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [acceptPrivacy](#acceptprivacy) | `boolean` | Required | cannot be null | [SaasRegisterInput](saasregisterinput-properties-acceptprivacy.md "undefined#/properties/acceptPrivacy") |
| [acceptTerms](#acceptterms)     | `boolean` | Required | cannot be null | [SaasRegisterInput](saasregisterinput-properties-acceptterms.md "undefined#/properties/acceptTerms")     |
| [businessName](#businessname)   | `string`  | Required | cannot be null | [SaasRegisterInput](saasregisterinput-properties-businessname.md "undefined#/properties/businessName")   |
| [cuit](#cuit)                   | `string`  | Required | cannot be null | [SaasRegisterInput](saasregisterinput-properties-cuit.md "undefined#/properties/cuit")                   |
| [email](#email)                 | `string`  | Required | cannot be null | [SaasRegisterInput](saasregisterinput-properties-email.md "undefined#/properties/email")                 |
| [password](#password)           | `string`  | Required | cannot be null | [SaasRegisterInput](saasregisterinput-properties-password.md "undefined#/properties/password")           |
| [phone](#phone)                 | `string`  | Optional | cannot be null | [SaasRegisterInput](saasregisterinput-properties-phone.md "undefined#/properties/phone")                 |
| [tenantSlug](#tenantslug)       | `string`  | Required | cannot be null | [SaasRegisterInput](saasregisterinput-properties-tenantslug.md "undefined#/properties/tenantSlug")       |

## acceptPrivacy



`acceptPrivacy`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SaasRegisterInput](saasregisterinput-properties-acceptprivacy.md "undefined#/properties/acceptPrivacy")

### acceptPrivacy Type

`boolean`

### acceptPrivacy Constraints

**constant**: the value of this property must be equal to:

```json
true
```

## acceptTerms



`acceptTerms`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SaasRegisterInput](saasregisterinput-properties-acceptterms.md "undefined#/properties/acceptTerms")

### acceptTerms Type

`boolean`

### acceptTerms Constraints

**constant**: the value of this property must be equal to:

```json
true
```

## businessName



`businessName`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasRegisterInput](saasregisterinput-properties-businessname.md "undefined#/properties/businessName")

### businessName Type

`string`

### businessName Constraints

**maximum length**: the maximum number of characters for this string is: `80`

**minimum length**: the minimum number of characters for this string is: `2`

## cuit



`cuit`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasRegisterInput](saasregisterinput-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

### cuit Constraints

**maximum length**: the maximum number of characters for this string is: `14`

**minimum length**: the minimum number of characters for this string is: `11`

## email



`email`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasRegisterInput](saasregisterinput-properties-email.md "undefined#/properties/email")

### email Type

`string`

### email Constraints

**maximum length**: the maximum number of characters for this string is: `120`

**email**: the string must be an email address, according to [RFC 5322, section 3.4.1](https://tools.ietf.org/html/rfc5322 "check the specification")

## password



`password`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasRegisterInput](saasregisterinput-properties-password.md "undefined#/properties/password")

### password Type

`string`

### password Constraints

**maximum length**: the maximum number of characters for this string is: `128`

**minimum length**: the minimum number of characters for this string is: `8`

## phone



`phone`

* is optional

* Type: `string`

* cannot be null

* defined in: [SaasRegisterInput](saasregisterinput-properties-phone.md "undefined#/properties/phone")

### phone Type

`string`

### phone Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## tenantSlug



`tenantSlug`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasRegisterInput](saasregisterinput-properties-tenantslug.md "undefined#/properties/tenantSlug")

### tenantSlug Type

`string`

### tenantSlug Constraints

**maximum length**: the maximum number of characters for this string is: `80`

**minimum length**: the minimum number of characters for this string is: `2`
