# VendedorZonaCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VendedorZonaCreateInput.schema.json](../schema-json/VendedorZonaCreateInput.schema.json "open original schema") |

## VendedorZonaCreateInput Type

`object` ([VendedorZonaCreateInput](vendedorzonacreateinput.md))

# VendedorZonaCreateInput Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                             |
| :-------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [deliveryZoneId](#deliveryzoneid) | `integer` | Required | cannot be null | [VendedorZonaCreateInput](vendedorzonacreateinput-properties-deliveryzoneid.md "undefined#/properties/deliveryZoneId") |
| [vendedorId](#vendedorid)         | `integer` | Required | cannot be null | [VendedorZonaCreateInput](vendedorzonacreateinput-properties-vendedorid.md "undefined#/properties/vendedorId")         |

## deliveryZoneId



`deliveryZoneId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VendedorZonaCreateInput](vendedorzonacreateinput-properties-deliveryzoneid.md "undefined#/properties/deliveryZoneId")

### deliveryZoneId Type

`integer`

### deliveryZoneId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## vendedorId



`vendedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VendedorZonaCreateInput](vendedorzonacreateinput-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`

### vendedorId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
