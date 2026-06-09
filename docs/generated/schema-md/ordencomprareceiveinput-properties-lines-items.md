# Untitled object in OrdenCompraReceiveInput Schema

```txt
undefined#/properties/lines/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenCompraReceiveInput.schema.json\*](../schema-json/OrdenCompraReceiveInput.schema.json "open original schema") |

## items Type

`object` ([Details](ordencomprareceiveinput-properties-lines-items.md))

# items Properties

| Property              | Type      | Required | Nullable       | Defined by                                                                                                                                               |
| :-------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [cantidad](#cantidad) | `integer` | Required | cannot be null | [OrdenCompraReceiveInput](ordencomprareceiveinput-properties-lines-items-properties-cantidad.md "undefined#/properties/lines/items/properties/cantidad") |
| [itemId](#itemid)     | `integer` | Required | cannot be null | [OrdenCompraReceiveInput](ordencomprareceiveinput-properties-lines-items-properties-itemid.md "undefined#/properties/lines/items/properties/itemId")     |

## cantidad



`cantidad`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompraReceiveInput](ordencomprareceiveinput-properties-lines-items-properties-cantidad.md "undefined#/properties/lines/items/properties/cantidad")

### cantidad Type

`integer`

### cantidad Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## itemId



`itemId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompraReceiveInput](ordencomprareceiveinput-properties-lines-items-properties-itemid.md "undefined#/properties/lines/items/properties/itemId")

### itemId Type

`integer`
