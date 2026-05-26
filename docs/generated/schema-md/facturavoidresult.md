# FacturaVoidResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaVoidResult.schema.json](../schema-json/FacturaVoidResult.schema.json "open original schema") |

## FacturaVoidResult Type

`object` ([FacturaVoidResult](facturavoidresult.md))

# FacturaVoidResult Properties

| Property                          | Type     | Required | Nullable       | Defined by                                                                               |
| :-------------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [factura](#factura)               | `object` | Required | cannot be null | [FacturaVoidResult](factura.md "undefined#/properties/factura")                          |
| [notaCredito](#notacredito)       | `object` | Required | cannot be null | [FacturaVoidResult](notacredito.md "undefined#/properties/notaCredito")                  |
| [updatedCliente](#updatedcliente) | `object` | Required | cannot be null | [FacturaVoidResult](facturavoidbalancecliente.md "undefined#/properties/updatedCliente") |

## factura



`factura`

* is required

* Type: `object` ([Factura](factura.md))

* cannot be null

* defined in: [FacturaVoidResult](factura.md "undefined#/properties/factura")

### factura Type

`object` ([Factura](factura.md))

## notaCredito



`notaCredito`

* is required

* Type: `object` ([NotaCredito](notacredito.md))

* cannot be null

* defined in: [FacturaVoidResult](notacredito.md "undefined#/properties/notaCredito")

### notaCredito Type

`object` ([NotaCredito](notacredito.md))

## updatedCliente



`updatedCliente`

* is required

* Type: `object` ([FacturaVoidBalanceCliente](facturavoidbalancecliente.md))

* cannot be null

* defined in: [FacturaVoidResult](facturavoidbalancecliente.md "undefined#/properties/updatedCliente")

### updatedCliente Type

`object` ([FacturaVoidBalanceCliente](facturavoidbalancecliente.md))
