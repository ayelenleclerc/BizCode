# PlantillaPedidoPatchBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Forbidden             | none                | [PlantillaPedidoPatchBody.schema.json](../schema-json/PlantillaPedidoPatchBody.schema.json "open original schema") |

## PlantillaPedidoPatchBody Type

`object` ([PlantillaPedidoPatchBody](plantillapedidopatchbody.md))

# PlantillaPedidoPatchBody Properties

| Property          | Type      | Required | Nullable       | Defined by                                                                                               |
| :---------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [activa](#activa) | `boolean` | Optional | cannot be null | [PlantillaPedidoPatchBody](plantillapedidopatchbody-properties-activa.md "undefined#/properties/activa") |
| [items](#items)   | `array`   | Optional | cannot be null | [PlantillaPedidoPatchBody](plantillapedidopatchbody-properties-items.md "undefined#/properties/items")   |
| [nombre](#nombre) | `string`  | Optional | cannot be null | [PlantillaPedidoPatchBody](plantillapedidopatchbody-properties-nombre.md "undefined#/properties/nombre") |

## activa



`activa`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [PlantillaPedidoPatchBody](plantillapedidopatchbody-properties-activa.md "undefined#/properties/activa")

### activa Type

`boolean`

## items



`items`

* is optional

* Type: `object[]` ([PlantillaPedidoItemInput](plantillapedidoiteminput.md))

* cannot be null

* defined in: [PlantillaPedidoPatchBody](plantillapedidopatchbody-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([PlantillaPedidoItemInput](plantillapedidoiteminput.md))

### items Constraints

**maximum number of items**: the maximum number of items for this array is: `100`

## nombre



`nombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [PlantillaPedidoPatchBody](plantillapedidopatchbody-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `80`

**minimum length**: the minimum number of characters for this string is: `1`
