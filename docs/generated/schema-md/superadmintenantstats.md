# SuperadminTenantStats Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SuperadminTenantStats.schema.json](../schema-json/SuperadminTenantStats.schema.json "open original schema") |

## SuperadminTenantStats Type

`object` ([SuperadminTenantStats](superadmintenantstats.md))

# SuperadminTenantStats Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                                     |
| :---------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [clienteCount](#clientecount) | `integer` | Required | cannot be null | [SuperadminTenantStats](superadmintenantstats-properties-clientecount.md "undefined#/properties/clienteCount") |
| [facturaCount](#facturacount) | `integer` | Required | cannot be null | [SuperadminTenantStats](superadmintenantstats-properties-facturacount.md "undefined#/properties/facturaCount") |
| [pedidoCount](#pedidocount)   | `integer` | Required | cannot be null | [SuperadminTenantStats](superadmintenantstats-properties-pedidocount.md "undefined#/properties/pedidoCount")   |
| [userCount](#usercount)       | `integer` | Required | cannot be null | [SuperadminTenantStats](superadmintenantstats-properties-usercount.md "undefined#/properties/userCount")       |

## clienteCount



`clienteCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminTenantStats](superadmintenantstats-properties-clientecount.md "undefined#/properties/clienteCount")

### clienteCount Type

`integer`

### clienteCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## facturaCount



`facturaCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminTenantStats](superadmintenantstats-properties-facturacount.md "undefined#/properties/facturaCount")

### facturaCount Type

`integer`

### facturaCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## pedidoCount



`pedidoCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminTenantStats](superadmintenantstats-properties-pedidocount.md "undefined#/properties/pedidoCount")

### pedidoCount Type

`integer`

### pedidoCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## userCount



`userCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminTenantStats](superadmintenantstats-properties-usercount.md "undefined#/properties/userCount")

### userCount Type

`integer`

### userCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`
