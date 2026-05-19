# AfipConfigStatus Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AfipConfigStatusEnvelope.schema.json\*](../schema-json/AfipConfigStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([AfipConfigStatus](afipconfigstatus.md))

# data Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [ambiente](#ambiente)     | `string`  | Optional | cannot be null | [AfipConfigStatus](afipconfigstatus-properties-ambiente.md "undefined#/properties/ambiente")     |
| [configured](#configured) | `boolean` | Required | cannot be null | [AfipConfigStatus](afipconfigstatus-properties-configured.md "undefined#/properties/configured") |
| [cuit](#cuit)             | `string`  | Optional | cannot be null | [AfipConfigStatus](afipconfigstatus-properties-cuit.md "undefined#/properties/cuit")             |

## ambiente



`ambiente`

* is optional

* Type: `string`

* cannot be null

* defined in: [AfipConfigStatus](afipconfigstatus-properties-ambiente.md "undefined#/properties/ambiente")

### ambiente Type

`string`

## configured



`configured`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AfipConfigStatus](afipconfigstatus-properties-configured.md "undefined#/properties/configured")

### configured Type

`boolean`

## cuit



`cuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [AfipConfigStatus](afipconfigstatus-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`
