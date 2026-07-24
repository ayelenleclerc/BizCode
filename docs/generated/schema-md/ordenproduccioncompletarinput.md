# OrdenProduccionCompletarInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenProduccionCompletarInput.schema.json](../schema-json/OrdenProduccionCompletarInput.schema.json "open original schema") |

## OrdenProduccionCompletarInput Type

`object` ([OrdenProduccionCompletarInput](ordenproduccioncompletarinput.md))

# OrdenProduccionCompletarInput Properties

| Property                      | Type     | Required | Nullable       | Defined by                                                                                                                     |
| :---------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [cantidadReal](#cantidadreal) | `number` | Required | cannot be null | [OrdenProduccionCompletarInput](ordenproduccioncompletarinput-properties-cantidadreal.md "undefined#/properties/cantidadReal") |
| [insumos](#insumos)           | `array`  | Optional | cannot be null | [OrdenProduccionCompletarInput](ordenproduccioncompletarinput-properties-insumos.md "undefined#/properties/insumos")           |

## cantidadReal



`cantidadReal`

* is required

* Type: `number`

* cannot be null

* defined in: [OrdenProduccionCompletarInput](ordenproduccioncompletarinput-properties-cantidadreal.md "undefined#/properties/cantidadReal")

### cantidadReal Type

`number`

### cantidadReal Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## insumos



`insumos`

* is optional

* Type: `object[]` ([Details](ordenproduccioncompletarinput-properties-insumos-items.md))

* cannot be null

* defined in: [OrdenProduccionCompletarInput](ordenproduccioncompletarinput-properties-insumos.md "undefined#/properties/insumos")

### insumos Type

`object[]` ([Details](ordenproduccioncompletarinput-properties-insumos-items.md))
