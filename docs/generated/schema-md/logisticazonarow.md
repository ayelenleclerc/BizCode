# LogisticaZonaRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                              |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------ |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LogisticaZonaRow.schema.json](../schema-json/LogisticaZonaRow.schema.json "open original schema") |

## LogisticaZonaRow Type

`object` ([LogisticaZonaRow](logisticazonarow.md))

# LogisticaZonaRow Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                           |
| :---------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [delivered](#delivered)       | `integer` | Required | cannot be null | [LogisticaZonaRow](logisticazonarow-properties-delivered.md "undefined#/properties/delivered")       |
| [dispatched](#dispatched)     | `integer` | Required | cannot be null | [LogisticaZonaRow](logisticazonarow-properties-dispatched.md "undefined#/properties/dispatched")     |
| [notDelivered](#notdelivered) | `integer` | Required | cannot be null | [LogisticaZonaRow](logisticazonarow-properties-notdelivered.md "undefined#/properties/notDelivered") |
| [zonaId](#zonaid)             | `integer` | Required | cannot be null | [LogisticaZonaRow](logisticazonarow-properties-zonaid.md "undefined#/properties/zonaId")             |
| [zonaNombre](#zonanombre)     | `string`  | Required | cannot be null | [LogisticaZonaRow](logisticazonarow-properties-zonanombre.md "undefined#/properties/zonaNombre")     |

## delivered



`delivered`

* is required

* Type: `integer`

* cannot be null

* defined in: [LogisticaZonaRow](logisticazonarow-properties-delivered.md "undefined#/properties/delivered")

### delivered Type

`integer`

### delivered Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## dispatched



`dispatched`

* is required

* Type: `integer`

* cannot be null

* defined in: [LogisticaZonaRow](logisticazonarow-properties-dispatched.md "undefined#/properties/dispatched")

### dispatched Type

`integer`

### dispatched Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## notDelivered



`notDelivered`

* is required

* Type: `integer`

* cannot be null

* defined in: [LogisticaZonaRow](logisticazonarow-properties-notdelivered.md "undefined#/properties/notDelivered")

### notDelivered Type

`integer`

### notDelivered Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## zonaId



`zonaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LogisticaZonaRow](logisticazonarow-properties-zonaid.md "undefined#/properties/zonaId")

### zonaId Type

`integer`

## zonaNombre



`zonaNombre`

* is required

* Type: `string`

* cannot be null

* defined in: [LogisticaZonaRow](logisticazonarow-properties-zonanombre.md "undefined#/properties/zonaNombre")

### zonaNombre Type

`string`
