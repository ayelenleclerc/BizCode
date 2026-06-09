# ModuleNotEnabledEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ModuleNotEnabledEnvelope.schema.json](../schema-json/ModuleNotEnabledEnvelope.schema.json "open original schema") |

## ModuleNotEnabledEnvelope Type

`object` ([ModuleNotEnabledEnvelope](modulenotenabledenvelope.md))

# ModuleNotEnabledEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [error](#error)     | `string`  | Required | cannot be null | [ModuleNotEnabledEnvelope](modulenotenabledenvelope-properties-error.md "undefined#/properties/error")     |
| [module](#module)   | `string`  | Required | cannot be null | [ModuleNotEnabledEnvelope](modulenotenabledenvelope-properties-module.md "undefined#/properties/module")   |
| [success](#success) | `boolean` | Required | cannot be null | [ModuleNotEnabledEnvelope](modulenotenabledenvelope-properties-success.md "undefined#/properties/success") |

## error



`error`

* is required

* Type: `string`

* cannot be null

* defined in: [ModuleNotEnabledEnvelope](modulenotenabledenvelope-properties-error.md "undefined#/properties/error")

### error Type

`string`

### error Constraints

**constant**: the value of this property must be equal to:

```json
"module_not_enabled"
```

## module



`module`

* is required

* Type: `string`

* cannot be null

* defined in: [ModuleNotEnabledEnvelope](modulenotenabledenvelope-properties-module.md "undefined#/properties/module")

### module Type

`string`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ModuleNotEnabledEnvelope](modulenotenabledenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
false
```
