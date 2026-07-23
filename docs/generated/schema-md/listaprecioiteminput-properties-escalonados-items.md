# Untitled object in ListaPrecioItemInput Schema

```txt
undefined#/properties/escalonados/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ListaPrecioItemInput.schema.json\*](../schema-json/ListaPrecioItemInput.schema.json "open original schema") |

## items Type

`object` ([Details](listaprecioiteminput-properties-escalonados-items.md))

# items Properties

| Property                        | Type     | Required | Nullable       | Defined by                                                                                                                                                               |
| :------------------------------ | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [cantidadDesde](#cantidaddesde) | `number` | Required | cannot be null | [ListaPrecioItemInput](listaprecioiteminput-properties-escalonados-items-properties-cantidaddesde.md "undefined#/properties/escalonados/items/properties/cantidadDesde") |
| [cantidadHasta](#cantidadhasta) | `number` | Optional | cannot be null | [ListaPrecioItemInput](listaprecioiteminput-properties-escalonados-items-properties-cantidadhasta.md "undefined#/properties/escalonados/items/properties/cantidadHasta") |
| [precio](#precio)               | `number` | Required | cannot be null | [ListaPrecioItemInput](listaprecioiteminput-properties-escalonados-items-properties-precio.md "undefined#/properties/escalonados/items/properties/precio")               |

## cantidadDesde



`cantidadDesde`

* is required

* Type: `number`

* cannot be null

* defined in: [ListaPrecioItemInput](listaprecioiteminput-properties-escalonados-items-properties-cantidaddesde.md "undefined#/properties/escalonados/items/properties/cantidadDesde")

### cantidadDesde Type

`number`

### cantidadDesde Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## cantidadHasta



`cantidadHasta`

* is optional

* Type: `number`

* cannot be null

* defined in: [ListaPrecioItemInput](listaprecioiteminput-properties-escalonados-items-properties-cantidadhasta.md "undefined#/properties/escalonados/items/properties/cantidadHasta")

### cantidadHasta Type

`number`

### cantidadHasta Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## precio



`precio`

* is required

* Type: `number`

* cannot be null

* defined in: [ListaPrecioItemInput](listaprecioiteminput-properties-escalonados-items-properties-precio.md "undefined#/properties/escalonados/items/properties/precio")

### precio Type

`number`

### precio Constraints

**minimum**: the value of this number must greater than or equal to: `0`
