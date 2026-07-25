# FidelizacionDashboardEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FidelizacionDashboardEnvelope.schema.json](../schema-json/FidelizacionDashboardEnvelope.schema.json "open original schema") |

## FidelizacionDashboardEnvelope Type

`object` ([FidelizacionDashboardEnvelope](fidelizaciondashboardenvelope.md))

# FidelizacionDashboardEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [FidelizacionDashboardEnvelope](fidelizaciondashboard.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [FidelizacionDashboardEnvelope](fidelizaciondashboardenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([FidelizacionDashboard](fidelizaciondashboard.md))

* cannot be null

* defined in: [FidelizacionDashboardEnvelope](fidelizaciondashboard.md "undefined#/properties/data")

### data Type

`object` ([FidelizacionDashboard](fidelizaciondashboard.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FidelizacionDashboardEnvelope](fidelizaciondashboardenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
