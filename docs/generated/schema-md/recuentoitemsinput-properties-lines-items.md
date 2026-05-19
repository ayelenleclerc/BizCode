# Untitled object in RecuentoItemsInput Schema

```txt
undefined#/properties/lines/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RecuentoItemsInput.schema.json\*](../schema-json/RecuentoItemsInput.schema.json "open original schema") |

## items Type

`object` ([Details](recuentoitemsinput-properties-lines-items.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                                                                         |
| :------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid) | `integer` | Required | cannot be null | [RecuentoItemsInput](recuentoitemsinput-properties-lines-items-properties-articuloid.md "undefined#/properties/lines/items/properties/articuloId") |
| [cantFisica](#cantfisica) | `integer` | Required | cannot be null | [RecuentoItemsInput](recuentoitemsinput-properties-lines-items-properties-cantfisica.md "undefined#/properties/lines/items/properties/cantFisica") |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RecuentoItemsInput](recuentoitemsinput-properties-lines-items-properties-articuloid.md "undefined#/properties/lines/items/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantFisica



`cantFisica`

* is required

* Type: `integer`

* cannot be null

* defined in: [RecuentoItemsInput](recuentoitemsinput-properties-lines-items-properties-cantfisica.md "undefined#/properties/lines/items/properties/cantFisica")

### cantFisica Type

`integer`

### cantFisica Constraints

**minimum**: the value of this number must greater than or equal to: `0`
