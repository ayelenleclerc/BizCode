# RepartoActivoCurrentStop Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoActivoCurrentStop.schema.json](../schema-json/RepartoActivoCurrentStop.schema.json "open original schema") |

## RepartoActivoCurrentStop Type

`object` ([RepartoActivoCurrentStop](repartoactivocurrentstop.md))

# RepartoActivoCurrentStop Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                     |
| :---------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [cliente](#cliente)     | `object`  | Required | cannot be null | [RepartoActivoCurrentStop](repartoactivocurrentstop-properties-cliente.md "undefined#/properties/cliente")     |
| [secuencia](#secuencia) | `integer` | Required | cannot be null | [RepartoActivoCurrentStop](repartoactivocurrentstop-properties-secuencia.md "undefined#/properties/secuencia") |
| [zona](#zona)           | `object`  | Optional | cannot be null | [RepartoActivoCurrentStop](repartoactivocurrentstop-properties-zona.md "undefined#/properties/zona")           |

## cliente



`cliente`

* is required

* Type: `object` ([Details](repartoactivocurrentstop-properties-cliente.md))

* cannot be null

* defined in: [RepartoActivoCurrentStop](repartoactivocurrentstop-properties-cliente.md "undefined#/properties/cliente")

### cliente Type

`object` ([Details](repartoactivocurrentstop-properties-cliente.md))

## secuencia



`secuencia`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoActivoCurrentStop](repartoactivocurrentstop-properties-secuencia.md "undefined#/properties/secuencia")

### secuencia Type

`integer`

### secuencia Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## zona



`zona`

* is optional

* Type: `object` ([Details](repartoactivocurrentstop-properties-zona.md))

* cannot be null

* defined in: [RepartoActivoCurrentStop](repartoactivocurrentstop-properties-zona.md "undefined#/properties/zona")

### zona Type

`object` ([Details](repartoactivocurrentstop-properties-zona.md))
