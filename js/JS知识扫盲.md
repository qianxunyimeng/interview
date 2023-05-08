# JS扫盲

## 关于对象规则设置

### 冻结

冻结对象：Object.freeze(obj)
监测是否被冻结：Object.isFrozen(obj) => true/false
被冻结的对象：不能修改成员值、不能新增成员、不能删除现有成员、不能对成员做数据劫持【Object.definProperty】

### 密封

密封对象：Object.seal(obj)
监测是否被密封： Object.isSealed(obj)
被密封的对象：可以修改成员值，但是不能删除、新增、劫持

### 扩展

把对象设置为不可扩展：Object.preventExtension(obj)
监测是否可扩展： Object.isExtensible(obj)
被设置不可扩展的对象：除了不能新增成员，其余操作都可以处理