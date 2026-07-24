# Untitled object in OrdenProduccionCompletarInput Schema

```txt
undefined#/properties/insumos/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenProduccionCompletarInput.schema.json\*](../schema-json/OrdenProduccionCompletarInput.schema.json "open original schema") |

## items Type

`object` ([Details](ordenproduccioncompletarinput-properties-insumos-items.md))

# items Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                                                                                                       |
| :---------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)     | `integer` | Required | cannot be null | [OrdenProduccionCompletarInput](ordenproduccioncompletarinput-properties-insumos-items-properties-articuloid.md "undefined#/properties/insumos/items/properties/articuloId")     |
| [cantidadReal](#cantidadreal) | `number`  | Required | cannot be null | [OrdenProduccionCompletarInput](ordenproduccioncompletarinput-properties-insumos-items-properties-cantidadreal.md "undefined#/properties/insumos/items/properties/cantidadReal") |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenProduccionCompletarInput](ordenproduccioncompletarinput-properties-insumos-items-properties-articuloid.md "undefined#/properties/insumos/items/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidadReal



`cantidadReal`

* is required

* Type: `number`

* cannot be null

* defined in: [OrdenProduccionCompletarInput](ordenproduccioncompletarinput-properties-insumos-items-properties-cantidadreal.md "undefined#/properties/insumos/items/properties/cantidadReal")

### cantidadReal Type

`number`

### cantidadReal Constraints

**minimum**: the value of this number must greater than or equal to: `0`
