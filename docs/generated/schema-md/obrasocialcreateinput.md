# ObraSocialCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ObraSocialCreateInput.schema.json](../schema-json/ObraSocialCreateInput.schema.json "open original schema") |

## ObraSocialCreateInput Type

`object` ([ObraSocialCreateInput](obrasocialcreateinput.md))

# ObraSocialCreateInput Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [activa](#activa)         | `boolean` | Optional | cannot be null | [ObraSocialCreateInput](obrasocialcreateinput-properties-activa.md "undefined#/properties/activa")         |
| [coberturas](#coberturas) | `array`   | Optional | cannot be null | [ObraSocialCreateInput](obrasocialcreateinput-properties-coberturas.md "undefined#/properties/coberturas") |
| [codigo](#codigo)         | `string`  | Required | cannot be null | [ObraSocialCreateInput](obrasocialcreateinput-properties-codigo.md "undefined#/properties/codigo")         |
| [nombre](#nombre)         | `string`  | Required | cannot be null | [ObraSocialCreateInput](obrasocialcreateinput-properties-nombre.md "undefined#/properties/nombre")         |

## activa



`activa`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ObraSocialCreateInput](obrasocialcreateinput-properties-activa.md "undefined#/properties/activa")

### activa Type

`boolean`

## coberturas



`coberturas`

* is optional

* Type: `object[]` ([CoberturaOSUpsertInput](coberturaosupsertinput.md))

* cannot be null

* defined in: [ObraSocialCreateInput](obrasocialcreateinput-properties-coberturas.md "undefined#/properties/coberturas")

### coberturas Type

`object[]` ([CoberturaOSUpsertInput](coberturaosupsertinput.md))

## codigo



`codigo`

* is required

* Type: `string`

* cannot be null

* defined in: [ObraSocialCreateInput](obrasocialcreateinput-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`string`

### codigo Constraints

**maximum length**: the maximum number of characters for this string is: `40`

**minimum length**: the minimum number of characters for this string is: `1`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [ObraSocialCreateInput](obrasocialcreateinput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `120`

**minimum length**: the minimum number of characters for this string is: `1`
