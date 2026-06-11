# Untitled object in ReciboCobroInput Schema

```txt
undefined#/properties/imputaciones/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReciboCobroInput.schema.json\*](../schema-json/ReciboCobroInput.schema.json "open original schema") |

## items Type

`object` ([Details](recibocobroinput-properties-imputaciones-items.md))

# items Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                                                                 |
| :---------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [facturaId](#facturaid) | `integer` | Required | cannot be null | [ReciboCobroInput](recibocobroinput-properties-imputaciones-items-properties-facturaid.md "undefined#/properties/imputaciones/items/properties/facturaId") |
| [importe](#importe)     | `number`  | Required | cannot be null | [ReciboCobroInput](recibocobroinput-properties-imputaciones-items-properties-importe.md "undefined#/properties/imputaciones/items/properties/importe")     |

## facturaId



`facturaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-imputaciones-items-properties-facturaid.md "undefined#/properties/imputaciones/items/properties/facturaId")

### facturaId Type

`integer`

### facturaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## importe



`importe`

* is required

* Type: `number`

* cannot be null

* defined in: [ReciboCobroInput](recibocobroinput-properties-imputaciones-items-properties-importe.md "undefined#/properties/imputaciones/items/properties/importe")

### importe Type

`number`

### importe Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`
