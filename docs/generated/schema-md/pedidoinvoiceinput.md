# PedidoInvoiceInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PedidoInvoiceInput.schema.json](../schema-json/PedidoInvoiceInput.schema.json "open original schema") |

## PedidoInvoiceInput Type

`object` ([PedidoInvoiceInput](pedidoinvoiceinput.md))

# PedidoInvoiceInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                             |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [fecha](#fecha)             | `string`  | Required | cannot be null | [PedidoInvoiceInput](pedidoinvoiceinput-properties-fecha.md "undefined#/properties/fecha")             |
| [formaPagoId](#formapagoid) | `integer` | Optional | cannot be null | [PedidoInvoiceInput](pedidoinvoiceinput-properties-formapagoid.md "undefined#/properties/formaPagoId") |
| [numero](#numero)           | `integer` | Required | cannot be null | [PedidoInvoiceInput](pedidoinvoiceinput-properties-numero.md "undefined#/properties/numero")           |
| [prefijo](#prefijo)         | `string`  | Optional | cannot be null | [PedidoInvoiceInput](pedidoinvoiceinput-properties-prefijo.md "undefined#/properties/prefijo")         |
| [tipo](#tipo)               | `string`  | Required | cannot be null | [PedidoInvoiceInput](pedidoinvoiceinput-properties-tipo.md "undefined#/properties/tipo")               |

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [PedidoInvoiceInput](pedidoinvoiceinput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

## formaPagoId



`formaPagoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [PedidoInvoiceInput](pedidoinvoiceinput-properties-formapagoid.md "undefined#/properties/formaPagoId")

### formaPagoId Type

`integer`

## numero



`numero`

* is required

* Type: `integer`

* cannot be null

* defined in: [PedidoInvoiceInput](pedidoinvoiceinput-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

### numero Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## prefijo



`prefijo`

* is optional

* Type: `string`

* cannot be null

* defined in: [PedidoInvoiceInput](pedidoinvoiceinput-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [PedidoInvoiceInput](pedidoinvoiceinput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"A"` |             |
| `"B"` |             |
