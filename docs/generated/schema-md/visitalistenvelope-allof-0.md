# Untitled object in VisitaListEnvelope Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VisitaListEnvelope.schema.json\*](../schema-json/VisitaListEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Details](visitalistenvelope-allof-0.md))

# 0 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [VisitaListEnvelope](visitalistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")       |
| [kpi](#kpi)         | `object`  | Optional | cannot be null | [VisitaListEnvelope](visitadiakpi.md "undefined#/allOf/0/properties/kpi")                                      |
| [success](#success) | `boolean` | Required | cannot be null | [VisitaListEnvelope](visitalistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Visita](visita.md))

* cannot be null

* defined in: [VisitaListEnvelope](visitalistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")

### data Type

`object[]` ([Visita](visita.md))

## kpi



`kpi`

* is optional

* Type: `object` ([VisitaDiaKpi](visitadiakpi.md))

* cannot be null

* defined in: [VisitaListEnvelope](visitadiakpi.md "undefined#/allOf/0/properties/kpi")

### kpi Type

`object` ([VisitaDiaKpi](visitadiakpi.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [VisitaListEnvelope](visitalistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
