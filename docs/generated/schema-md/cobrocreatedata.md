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
| [updatedCliente](#updatedcliente) | `object` | Required | cannot be null | [CobroCreateData](cobrocreatedata-properties-updatedcliente.md "undefined#/properties/updatedCliente") |

## cobro



`cobro`

* is required

* Type: `object` ([Cobro](cobro.md))

* cannot be null

* defined in: [CobroCreateData](cobro.md "undefined#/properties/cobro")

### cobro Type

`object` ([Cobro](cobro.md))

## updatedCliente



`updatedCliente`

* is required

* Type: `object` ([Details](cobrocreatedata-properties-updatedcliente.md))

* cannot be null

* defined in: [CobroCreateData](cobrocreatedata-properties-updatedcliente.md "undefined#/properties/updatedCliente")

### updatedCliente Type

`object` ([Details](cobrocreatedata-properties-updatedcliente.md))
