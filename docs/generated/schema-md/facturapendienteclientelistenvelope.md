# FacturaPendienteClienteListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaPendienteClienteListEnvelope.schema.json](../schema-json/FacturaPendienteClienteListEnvelope.schema.json "open original schema") |

## FacturaPendienteClienteListEnvelope Type

`object` ([FacturaPendienteClienteListEnvelope](facturapendienteclientelistenvelope.md))

# FacturaPendienteClienteListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [FacturaPendienteClienteListEnvelope](facturapendienteclientelistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [FacturaPendienteClienteListEnvelope](facturapendienteclientelistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([FacturaPendienteCliente](facturapendientecliente.md))

* cannot be null

* defined in: [FacturaPendienteClienteListEnvelope](facturapendienteclientelistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([FacturaPendienteCliente](facturapendientecliente.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FacturaPendienteClienteListEnvelope](facturapendienteclientelistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
