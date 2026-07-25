# LoteTrazabilidad Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoteTrazabilidadEnvelope.schema.json\*](../schema-json/LoteTrazabilidadEnvelope.schema.json "open original schema") |

## data Type

`object` ([LoteTrazabilidad](lotetrazabilidad.md))

# data Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                   |
| :-------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [facturas](#facturas) | `array`  | Required | cannot be null | [LoteTrazabilidad](lotetrazabilidad-properties-facturas.md "undefined#/properties/facturas") |
| [lote](#lote)         | `object` | Required | cannot be null | [LoteTrazabilidad](lote.md "undefined#/properties/lote")                                     |

## facturas



`facturas`

* is required

* Type: `object[]` ([Details](lotetrazabilidad-properties-facturas-items.md))

* cannot be null

* defined in: [LoteTrazabilidad](lotetrazabilidad-properties-facturas.md "undefined#/properties/facturas")

### facturas Type

`object[]` ([Details](lotetrazabilidad-properties-facturas-items.md))

## lote



`lote`

* is required

* Type: `object` ([Lote](lote.md))

* cannot be null

* defined in: [LoteTrazabilidad](lote.md "undefined#/properties/lote")

### lote Type

`object` ([Lote](lote.md))
