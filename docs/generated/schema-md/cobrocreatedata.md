# CobroCreateData Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CobroCreateEnvelope.schema.json\*](../schema-json/CobroCreateEnvelope.schema.json "open original schema") |

## data Type

`object` ([CobroCreateData](cobrocreatedata.md))

# data Properties

| Property                          | Type     | Required | Nullable       | Defined by                                                                                             |
| :-------------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [cobro](#cobro)                   | `object` | Required | cannot be null | [CobroCreateData](cobro.md "undefined#/properties/cobro")                                              |
| [montoBruto](#montobruto)         | `string` | Required | cannot be null | [CobroCreateData](cobrocreatedata-properties-montobruto.md "undefined#/properties/montoBruto")         |
| [retenciones](#retenciones)       | `array`  | Required | cannot be null | [CobroCreateData](cobrocreatedata-properties-retenciones.md "undefined#/properties/retenciones")       |
| [updatedCliente](#updatedcliente) | `object` | Required | cannot be null | [CobroCreateData](cobrocreatedata-properties-updatedcliente.md "undefined#/properties/updatedCliente") |

## cobro



`cobro`

* is required

* Type: `object` ([Cobro](cobro.md))

* cannot be null

* defined in: [CobroCreateData](cobro.md "undefined#/properties/cobro")

### cobro Type

`object` ([Cobro](cobro.md))

## montoBruto

Bruto applied to customer balance (neto + retenciones).

`montoBruto`

* is required

* Type: `string`

* cannot be null

* defined in: [CobroCreateData](cobrocreatedata-properties-montobruto.md "undefined#/properties/montoBruto")

### montoBruto Type

`string`

## retenciones



`retenciones`

* is required

* Type: `object[]` ([CobroRetencion](cobroretencion.md))

* cannot be null

* defined in: [CobroCreateData](cobrocreatedata-properties-retenciones.md "undefined#/properties/retenciones")

### retenciones Type

`object[]` ([CobroRetencion](cobroretencion.md))

## updatedCliente



`updatedCliente`

* is required

* Type: `object` ([Details](cobrocreatedata-properties-updatedcliente.md))

* cannot be null

* defined in: [CobroCreateData](cobrocreatedata-properties-updatedcliente.md "undefined#/properties/updatedCliente")

### updatedCliente Type

`object` ([Details](cobrocreatedata-properties-updatedcliente.md))
