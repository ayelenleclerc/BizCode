# ArcaConfigStatus Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArcaConfigStatusEnvelope.schema.json\*](../schema-json/ArcaConfigStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([ArcaConfigStatus](afipconfigstatus.md))

# data Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [ambiente](#ambiente)     | `string`  | Optional | cannot be null | [ArcaConfigStatus](afipconfigstatus-properties-ambiente.md "undefined#/properties/ambiente")     |
| [configured](#configured) | `boolean` | Required | cannot be null | [ArcaConfigStatus](afipconfigstatus-properties-configured.md "undefined#/properties/configured") |
| [cuit](#cuit)             | `string`  | Optional | cannot be null | [ArcaConfigStatus](afipconfigstatus-properties-cuit.md "undefined#/properties/cuit")             |

## ambiente



`ambiente`

* is optional

* Type: `string`

* cannot be null

* defined in: [ArcaConfigStatus](afipconfigstatus-properties-ambiente.md "undefined#/properties/ambiente")

### ambiente Type

`string`

## configured



`configured`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArcaConfigStatus](afipconfigstatus-properties-configured.md "undefined#/properties/configured")

### configured Type

`boolean`

## cuit



`cuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [ArcaConfigStatus](afipconfigstatus-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`
