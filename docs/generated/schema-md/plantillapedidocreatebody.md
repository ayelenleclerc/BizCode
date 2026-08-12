# PlantillaPedidoCreateBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Forbidden             | none                | [PlantillaPedidoCreateBody.schema.json](../schema-json/PlantillaPedidoCreateBody.schema.json "open original schema") |

## PlantillaPedidoCreateBody Type

`object` ([PlantillaPedidoCreateBody](plantillapedidocreatebody.md))

# PlantillaPedidoCreateBody Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [activa](#activa)         | `boolean` | Optional | cannot be null | [PlantillaPedidoCreateBody](plantillapedidocreatebody-properties-activa.md "undefined#/properties/activa")         |
| [items](#items)           | `array`   | Required | cannot be null | [PlantillaPedidoCreateBody](plantillapedidocreatebody-properties-items.md "undefined#/properties/items")           |
| [nombre](#nombre)         | `string`  | Required | cannot be null | [PlantillaPedidoCreateBody](plantillapedidocreatebody-properties-nombre.md "undefined#/properties/nombre")         |
| [vendedorId](#vendedorid) | `integer` | Optional | cannot be null | [PlantillaPedidoCreateBody](plantillapedidocreatebody-properties-vendedorid.md "undefined#/properties/vendedorId") |

## activa



`activa`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [PlantillaPedidoCreateBody](plantillapedidocreatebody-properties-activa.md "undefined#/properties/activa")

### activa Type

`boolean`

## items



`items`

* is required

* Type: `object[]` ([PlantillaPedidoItemInput](plantillapedidoiteminput.md))

* cannot be null

* defined in: [PlantillaPedidoCreateBody](plantillapedidocreatebody-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([PlantillaPedidoItemInput](plantillapedidoiteminput.md))

### items Constraints

**maximum number of items**: the maximum number of items for this array is: `100`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [PlantillaPedidoCreateBody](plantillapedidocreatebody-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `80`

**minimum length**: the minimum number of characters for this string is: `1`

## vendedorId



`vendedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [PlantillaPedidoCreateBody](plantillapedidocreatebody-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`

### vendedorId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
