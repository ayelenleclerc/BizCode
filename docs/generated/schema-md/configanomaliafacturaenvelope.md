# ConfigAnomaliaFacturaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConfigAnomaliaFacturaEnvelope.schema.json](../schema-json/ConfigAnomaliaFacturaEnvelope.schema.json "open original schema") |

## ConfigAnomaliaFacturaEnvelope Type

`object` ([ConfigAnomaliaFacturaEnvelope](configanomaliafacturaenvelope.md))

# ConfigAnomaliaFacturaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ConfigAnomaliaFacturaEnvelope](configanomaliafactura.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ConfigAnomaliaFacturaEnvelope](configanomaliafacturaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ConfigAnomaliaFactura](configanomaliafactura.md))

* cannot be null

* defined in: [ConfigAnomaliaFacturaEnvelope](configanomaliafactura.md "undefined#/properties/data")

### data Type

`object` ([ConfigAnomaliaFactura](configanomaliafactura.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ConfigAnomaliaFacturaEnvelope](configanomaliafacturaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
