&emsp;&emsp;<a name="TypeParameters"></a>*TypeParameters* **:**  
&emsp;&emsp;&emsp;<a name="TypeParameters-j84gqwv2"></a>`` < ``&emsp;*[TypeParameterList](#TypeParameterList)*&emsp;`` > ``  
  
&emsp;&emsp;<a name="TypeParameterList"></a>*TypeParameterList* **:**  
&emsp;&emsp;&emsp;<a name="TypeParameterList-sbsfxh8z"></a>*[TypeParameter](#TypeParameter)*  
&emsp;&emsp;&emsp;<a name="TypeParameterList-iqrczeqe"></a>*[TypeParameterList](#TypeParameterList)*&emsp;`` , ``&emsp;*[TypeParameter](#TypeParameter)*  
  
&emsp;&emsp;<a name="TypeParameter"></a>*TypeParameter* **:**  
&emsp;&emsp;&emsp;<a name="TypeParameter-losvira7"></a>*[Identifier](#Identifier)*&emsp;*[Constraint](#Constraint)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="Constraint"></a>*Constraint* **:**  
&emsp;&emsp;&emsp;<a name="Constraint-9cwbuor4"></a>`` extends ``&emsp;*[Type](#Type)*  
  
&emsp;&emsp;<a name="TypeArguments"></a>*TypeArguments* **:**  
&emsp;&emsp;&emsp;<a name="TypeArguments-j4ybtsu7"></a>`` < ``&emsp;*[TypeArgumentList](#TypeArgumentList)*&emsp;`` > ``  
  
&emsp;&emsp;<a name="TypeArgumentList"></a>*TypeArgumentList* **:**  
&emsp;&emsp;&emsp;<a name="TypeArgumentList--j6hx8wb"></a>*[TypeArgument](#TypeArgument)*  
&emsp;&emsp;&emsp;<a name="TypeArgumentList-atmwfbm0"></a>*[TypeArgumentList](#TypeArgumentList)*&emsp;`` , ``&emsp;*[TypeArgument](#TypeArgument)*  
  
&emsp;&emsp;<a name="TypeArgument"></a>*TypeArgument* **:**  
&emsp;&emsp;&emsp;<a name="TypeArgument-pet0vlgw"></a>*[Type](#Type)*  
  
&emsp;&emsp;<a name="Type"></a>*Type* **:**  
&emsp;&emsp;&emsp;<a name="Type-jxvk7ktc"></a>*[PrimaryOrUnionType](#PrimaryOrUnionType)*  
&emsp;&emsp;&emsp;<a name="Type-6u6d7nzy"></a>*[FunctionType](#FunctionType)*  
&emsp;&emsp;&emsp;<a name="Type-pgjubjo4"></a>*[ConstructorType](#ConstructorType)*  
  
&emsp;&emsp;<a name="PrimaryOrUnionType"></a>*PrimaryOrUnionType* **:**  
&emsp;&emsp;&emsp;<a name="PrimaryOrUnionType-lxo0rcnf"></a>*[PrimaryType](#PrimaryType)*  
&emsp;&emsp;&emsp;<a name="PrimaryOrUnionType-lp7xv-4o"></a>*[UnionType](#UnionType)*  
  
&emsp;&emsp;<a name="PrimaryType"></a>*PrimaryType* **:**  
&emsp;&emsp;&emsp;<a name="PrimaryType-6j_y7b71"></a>*[ParenthesizedType](#ParenthesizedType)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-ru6k2blf"></a>*[PredefinedType](#PredefinedType)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-doi8ufqr"></a>*[TypeReference](#TypeReference)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-npg5mc7u"></a>*[ObjectType](#ObjectType)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-d-chgvaw"></a>*[ArrayType](#ArrayType)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-r-pz8wjb"></a>*[TupleType](#TupleType)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-kkaxychj"></a>*[TypeQuery](#TypeQuery)*  
  
&emsp;&emsp;<a name="ParenthesizedType"></a>*ParenthesizedType* **:**  
&emsp;&emsp;&emsp;<a name="ParenthesizedType-gsj9qeha"></a>`` ( ``&emsp;*[Type](#Type)*&emsp;`` ) ``  
  
&emsp;&emsp;<a name="PredefinedType"></a>*PredefinedType* **:**  
&emsp;&emsp;&emsp;<a name="PredefinedType-jkf5sbch"></a>`` any ``  
&emsp;&emsp;&emsp;<a name="PredefinedType-z4---fed"></a>`` number ``  
&emsp;&emsp;&emsp;<a name="PredefinedType-xojwtyvy"></a>`` boolean ``  
&emsp;&emsp;&emsp;<a name="PredefinedType-9ceksxvm"></a>`` string ``  
&emsp;&emsp;&emsp;<a name="PredefinedType-llgnlz3m"></a>`` void ``  
  
&emsp;&emsp;<a name="TypeReference"></a>*TypeReference* **:**  
&emsp;&emsp;&emsp;<a name="TypeReference-gdwbnckg"></a>*[TypeName](#TypeName)*&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[TypeArguments](#TypeArguments)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="TypeName"></a>*TypeName* **:**  
&emsp;&emsp;&emsp;<a name="TypeName-bras6mo_"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="TypeName-wn3huwdx"></a>*[ModuleName](#ModuleName)*&emsp;`` . ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="ModuleName"></a>*ModuleName* **:**  
&emsp;&emsp;&emsp;<a name="ModuleName-bras6mo_"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="ModuleName-wn3huwdx"></a>*[ModuleName](#ModuleName)*&emsp;`` . ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="ObjectType"></a>*ObjectType* **:**  
&emsp;&emsp;&emsp;<a name="ObjectType-p6isgtq9"></a>`` { ``&emsp;*[TypeBody](#TypeBody)*<sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="TypeBody"></a>*TypeBody* **:**  
&emsp;&emsp;&emsp;<a name="TypeBody-vcyrwkvb"></a>*[TypeMemberList](#TypeMemberList)*&emsp;`` ; ``<sub>opt</sub>  
  
&emsp;&emsp;<a name="TypeMemberList"></a>*TypeMemberList* **:**  
&emsp;&emsp;&emsp;<a name="TypeMemberList-tpqpwb-p"></a>*[TypeMember](#TypeMember)*  
&emsp;&emsp;&emsp;<a name="TypeMemberList-hnywlvk3"></a>*[TypeMemberList](#TypeMemberList)*&emsp;`` ; ``&emsp;*[TypeMember](#TypeMember)*  
  
&emsp;&emsp;<a name="TypeMember"></a>*TypeMember* **:**  
&emsp;&emsp;&emsp;<a name="TypeMember-iqa7mgye"></a>*[PropertySignature](#PropertySignature)*  
&emsp;&emsp;&emsp;<a name="TypeMember-wvaylxq2"></a>*[CallSignature](#CallSignature)*  
&emsp;&emsp;&emsp;<a name="TypeMember-vvw1kmsw"></a>*[ConstructSignature](#ConstructSignature)*  
&emsp;&emsp;&emsp;<a name="TypeMember-dda1seh7"></a>*[IndexSignature](#IndexSignature)*  
&emsp;&emsp;&emsp;<a name="TypeMember-us181up8"></a>*[MethodSignature](#MethodSignature)*  
  
&emsp;&emsp;<a name="ArrayType"></a>*ArrayType* **:**  
&emsp;&emsp;&emsp;<a name="ArrayType-poxxbrgz"></a>*[PrimaryType](#PrimaryType)*&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;`` [ ``&emsp;`` ] ``  
  
&emsp;&emsp;<a name="TupleType"></a>*TupleType* **:**  
&emsp;&emsp;&emsp;<a name="TupleType-uxpx15sl"></a>`` [ ``&emsp;*[TupleElementTypes](#TupleElementTypes)*&emsp;`` ] ``  
  
&emsp;&emsp;<a name="TupleElementTypes"></a>*TupleElementTypes* **:**  
&emsp;&emsp;&emsp;<a name="TupleElementTypes-7aahtiui"></a>*[TupleElementType](#TupleElementType)*  
&emsp;&emsp;&emsp;<a name="TupleElementTypes-a9aadenk"></a>*[TupleElementTypes](#TupleElementTypes)*&emsp;`` , ``&emsp;*[TupleElementType](#TupleElementType)*  
  
&emsp;&emsp;<a name="TupleElementType"></a>*TupleElementType* **:**  
&emsp;&emsp;&emsp;<a name="TupleElementType-pet0vlgw"></a>*[Type](#Type)*  
  
&emsp;&emsp;<a name="UnionType"></a>*UnionType* **:**  
&emsp;&emsp;&emsp;<a name="UnionType-k9i9jzgd"></a>*[PrimaryOrUnionType](#PrimaryOrUnionType)*&emsp;`` | ``&emsp;*[PrimaryType](#PrimaryType)*  
  
&emsp;&emsp;<a name="FunctionType"></a>*FunctionType* **:**  
&emsp;&emsp;&emsp;<a name="FunctionType-j3qc52j6"></a>*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` => ``&emsp;*[Type](#Type)*  
  
&emsp;&emsp;<a name="ConstructorType"></a>*ConstructorType* **:**  
&emsp;&emsp;&emsp;<a name="ConstructorType-rjchtdve"></a>`` new ``&emsp;*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` => ``&emsp;*[Type](#Type)*  
  
&emsp;&emsp;<a name="TypeQuery"></a>*TypeQuery* **:**  
&emsp;&emsp;&emsp;<a name="TypeQuery-f9wqykn1"></a>`` typeof ``&emsp;*[TypeQueryExpression](#TypeQueryExpression)*  
  
&emsp;&emsp;<a name="TypeQueryExpression"></a>*TypeQueryExpression* **:**  
&emsp;&emsp;&emsp;<a name="TypeQueryExpression-bras6mo_"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="TypeQueryExpression-dmo6-6na"></a>*[TypeQueryExpression](#TypeQueryExpression)*&emsp;`` . ``&emsp;*[IdentifierName](#IdentifierName)*  
  
&emsp;&emsp;<a name="PropertySignature"></a>*PropertySignature* **:**  
&emsp;&emsp;&emsp;<a name="PropertySignature-rwjfidb8"></a>*[PropertyName](#PropertyName)*&emsp;`` ? ``<sub>opt</sub>&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="PropertyName"></a>*PropertyName* **:**  
&emsp;&emsp;&emsp;<a name="PropertyName-drsx4tka"></a>*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="PropertyName-xhtltz00"></a>*[StringLiteral](#StringLiteral)*  
&emsp;&emsp;&emsp;<a name="PropertyName-pui0b1rt"></a>*[NumericLiteral](#NumericLiteral)*  
  
&emsp;&emsp;<a name="CallSignature"></a>*CallSignature* **:**  
&emsp;&emsp;&emsp;<a name="CallSignature-sawjncpj"></a>*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ParameterList"></a>*ParameterList* **:**  
&emsp;&emsp;&emsp;<a name="ParameterList-v3hb8gjj"></a>*[RequiredParameterList](#RequiredParameterList)*  
&emsp;&emsp;&emsp;<a name="ParameterList-naezw1l7"></a>*[OptionalParameterList](#OptionalParameterList)*  
&emsp;&emsp;&emsp;<a name="ParameterList-gztavbfv"></a>*[RestParameter](#RestParameter)*  
&emsp;&emsp;&emsp;<a name="ParameterList-xfsi2-06"></a>*[RequiredParameterList](#RequiredParameterList)*&emsp;`` , ``&emsp;*[OptionalParameterList](#OptionalParameterList)*  
&emsp;&emsp;&emsp;<a name="ParameterList-zqg5m_vc"></a>*[RequiredParameterList](#RequiredParameterList)*&emsp;`` , ``&emsp;*[RestParameter](#RestParameter)*  
&emsp;&emsp;&emsp;<a name="ParameterList-fsuu33gw"></a>*[OptionalParameterList](#OptionalParameterList)*&emsp;`` , ``&emsp;*[RestParameter](#RestParameter)*  
&emsp;&emsp;&emsp;<a name="ParameterList-fydufsiz"></a>*[RequiredParameterList](#RequiredParameterList)*&emsp;`` , ``&emsp;*[OptionalParameterList](#OptionalParameterList)*&emsp;`` , ``&emsp;*[RestParameter](#RestParameter)*  
  
&emsp;&emsp;<a name="RequiredParameterList"></a>*RequiredParameterList* **:**  
&emsp;&emsp;&emsp;<a name="RequiredParameterList-yym9p9dk"></a>*[RequiredParameter](#RequiredParameter)*  
&emsp;&emsp;&emsp;<a name="RequiredParameterList-_jlpajvp"></a>*[RequiredParameterList](#RequiredParameterList)*&emsp;`` , ``&emsp;*[RequiredParameter](#RequiredParameter)*  
  
&emsp;&emsp;<a name="RequiredParameter"></a>*RequiredParameter* **:**  
&emsp;&emsp;&emsp;<a name="RequiredParameter-a4kgyslv"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="RequiredParameter-5phuwasw"></a>*[Identifier](#Identifier)*&emsp;`` : ``&emsp;*[StringLiteral](#StringLiteral)*  
  
&emsp;&emsp;<a name="AccessibilityModifier"></a>*AccessibilityModifier* **:**  
&emsp;&emsp;&emsp;<a name="AccessibilityModifier-is9v4klr"></a>`` public ``  
&emsp;&emsp;&emsp;<a name="AccessibilityModifier-rz4nxfeh"></a>`` private ``  
&emsp;&emsp;&emsp;<a name="AccessibilityModifier-wdoy35lb"></a>`` protected ``  
  
&emsp;&emsp;<a name="OptionalParameterList"></a>*OptionalParameterList* **:**  
&emsp;&emsp;&emsp;<a name="OptionalParameterList-elq3hohl"></a>*[OptionalParameter](#OptionalParameter)*  
&emsp;&emsp;&emsp;<a name="OptionalParameterList-lgujwsmg"></a>*[OptionalParameterList](#OptionalParameterList)*&emsp;`` , ``&emsp;*[OptionalParameter](#OptionalParameter)*  
  
&emsp;&emsp;<a name="OptionalParameter"></a>*OptionalParameter* **:**  
&emsp;&emsp;&emsp;<a name="OptionalParameter-9qxxavzr"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;*[Identifier](#Identifier)*&emsp;`` ? ``&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="OptionalParameter-nw6fqefe"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;*[Initializer](#Initializer)*  
&emsp;&emsp;&emsp;<a name="OptionalParameter-ljdamfjl"></a>*[Identifier](#Identifier)*&emsp;`` ? ``&emsp;`` : ``&emsp;*[StringLiteral](#StringLiteral)*  
  
&emsp;&emsp;<a name="RestParameter"></a>*RestParameter* **:**  
&emsp;&emsp;&emsp;<a name="RestParameter-qnrsr_2q"></a>`` ... ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ConstructSignature"></a>*ConstructSignature* **:**  
&emsp;&emsp;&emsp;<a name="ConstructSignature-z5_wmqij"></a>`` new ``&emsp;*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="IndexSignature"></a>*IndexSignature* **:**  
&emsp;&emsp;&emsp;<a name="IndexSignature-pyfkffrh"></a>`` [ ``&emsp;*[Identifier](#Identifier)*&emsp;`` : ``&emsp;`` string ``&emsp;`` ] ``&emsp;*[TypeAnnotation](#TypeAnnotation)*  
&emsp;&emsp;&emsp;<a name="IndexSignature-ssjacyh-"></a>`` [ ``&emsp;*[Identifier](#Identifier)*&emsp;`` : ``&emsp;`` number ``&emsp;`` ] ``&emsp;*[TypeAnnotation](#TypeAnnotation)*  
  
&emsp;&emsp;<a name="MethodSignature"></a>*MethodSignature* **:**  
&emsp;&emsp;&emsp;<a name="MethodSignature-adituqqp"></a>*[PropertyName](#PropertyName)*&emsp;`` ? ``<sub>opt</sub>&emsp;*[CallSignature](#CallSignature)*  
  
&emsp;&emsp;<a name="TypeAliasDeclaration"></a>*TypeAliasDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="TypeAliasDeclaration-hrueer9l"></a>`` type ``&emsp;*[Identifier](#Identifier)*&emsp;`` = ``&emsp;*[Type](#Type)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="PropertyAssignment"></a>*PropertyAssignment* **:**  
&emsp;&emsp;&emsp;<a name="PropertyAssignment-8tkldtak"></a>*[PropertyName](#PropertyName)*&emsp;`` : ``&emsp;*[AssignmentExpression](#AssignmentExpression)*  
&emsp;&emsp;&emsp;<a name="PropertyAssignment-9h-excaf"></a>*[PropertyName](#PropertyName)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="PropertyAssignment-lge64g5s"></a>*[GetAccessor](#GetAccessor)*  
&emsp;&emsp;&emsp;<a name="PropertyAssignment-ctqfc6zw"></a>*[SetAccessor](#SetAccessor)*  
  
&emsp;&emsp;<a name="GetAccessor"></a>*GetAccessor* **:**  
&emsp;&emsp;&emsp;<a name="GetAccessor-vu040nrz"></a>`` get ``&emsp;*[PropertyName](#PropertyName)*&emsp;`` ( ``&emsp;`` ) ``&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="SetAccessor"></a>*SetAccessor* **:**  
&emsp;&emsp;&emsp;<a name="SetAccessor-5fcxcli2"></a>`` set ``&emsp;*[PropertyName](#PropertyName)*&emsp;`` ( ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="ElementList"></a>*ElementList* **:**  
&emsp;&emsp;&emsp;<a name="ElementList-2aa1epou"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[AssignmentExpression](#AssignmentExpression)*  
&emsp;&emsp;&emsp;<a name="ElementList-fbpz0ate"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[SpreadElement](#SpreadElement)*  
&emsp;&emsp;&emsp;<a name="ElementList-_sr5sq6t"></a>*[ElementList](#ElementList)*&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[AssignmentExpression](#AssignmentExpression)*  
&emsp;&emsp;&emsp;<a name="ElementList-aleaauxs"></a>*[ElementList](#ElementList)*&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[SpreadElement](#SpreadElement)*  
  
&emsp;&emsp;<a name="SpreadElement"></a>*SpreadElement* **:**  
&emsp;&emsp;&emsp;<a name="SpreadElement-w7ifpmpd"></a>`` ... ``&emsp;*[AssignmentExpression](#AssignmentExpression)*  
  
&emsp;&emsp;<a name="CallExpression"></a>*CallExpression* **:**  
&emsp;&emsp;&emsp;<a name="CallExpression-ndm6n201"></a>`` super ``&emsp;`` ( ``&emsp;*[ArgumentList](#ArgumentList)*<sub>opt</sub>&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="CallExpression-9pdsslwb"></a>`` super ``&emsp;`` . ``&emsp;*[IdentifierName](#IdentifierName)*  
  
&emsp;&emsp;<a name="FunctionExpression"></a>*FunctionExpression* **:**  
&emsp;&emsp;&emsp;<a name="FunctionExpression-rg_2_la_"></a>`` function ``&emsp;*[Identifier](#Identifier)*<sub>opt</sub>&emsp;*[CallSignature](#CallSignature)*&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="AssignmentExpression"></a>*AssignmentExpression* **:**  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-vq0s3qsx"></a>*[ArrowFunctionExpression](#ArrowFunctionExpression)*  
  
&emsp;&emsp;<a name="ArrowFunctionExpression"></a>*ArrowFunctionExpression* **:**  
&emsp;&emsp;&emsp;<a name="ArrowFunctionExpression-vda-z8mf"></a>*[ArrowFormalParameters](#ArrowFormalParameters)*&emsp;`` => ``&emsp;*[Block](#Block)*  
&emsp;&emsp;&emsp;<a name="ArrowFunctionExpression-bbqiznx8"></a>*[ArrowFormalParameters](#ArrowFormalParameters)*&emsp;`` => ``&emsp;*[AssignmentExpression](#AssignmentExpression)*  
  
&emsp;&emsp;<a name="ArrowFormalParameters"></a>*ArrowFormalParameters* **:**  
&emsp;&emsp;&emsp;<a name="ArrowFormalParameters-wvaylxq2"></a>*[CallSignature](#CallSignature)*  
&emsp;&emsp;&emsp;<a name="ArrowFormalParameters-bras6mo_"></a>*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="Arguments"></a>*Arguments* **:**  
&emsp;&emsp;&emsp;<a name="Arguments-58row_9l"></a>*[TypeArguments](#TypeArguments)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[ArgumentList](#ArgumentList)*<sub>opt</sub>&emsp;`` ) ``  
  
&emsp;&emsp;<a name="UnaryExpression"></a>*UnaryExpression* **:**  
&emsp;&emsp;&emsp;<a name="UnaryExpression-corhaxbf"></a>`` < ``&emsp;*[Type](#Type)*&emsp;`` > ``&emsp;*[UnaryExpression](#UnaryExpression)*  
  
&emsp;&emsp;<a name="VariableDeclaration"></a>*VariableDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="VariableDeclaration-lnw_fnc-"></a>*[SimpleVariableDeclaration](#SimpleVariableDeclaration)*  
&emsp;&emsp;&emsp;<a name="VariableDeclaration-6qd2zlam"></a>*[DestructuringVariableDeclaration](#DestructuringVariableDeclaration)*  
  
&emsp;&emsp;<a name="SimpleVariableDeclaration"></a>*SimpleVariableDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="SimpleVariableDeclaration-2qpwvpma"></a>*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="TypeAnnotation"></a>*TypeAnnotation* **:**  
&emsp;&emsp;&emsp;<a name="TypeAnnotation-fwkgihaq"></a>`` : ``&emsp;*[Type](#Type)*  
  
&emsp;&emsp;<a name="DestructuringVariableDeclaration"></a>*DestructuringVariableDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="DestructuringVariableDeclaration-vezatff5"></a>*[BindingPattern](#BindingPattern)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;*[Initializer](#Initializer)*  
  
&emsp;&emsp;<a name="BindingPattern"></a>*BindingPattern* **:**  
&emsp;&emsp;&emsp;<a name="BindingPattern-mh3oqyo8"></a>*[ObjectBindingPattern](#ObjectBindingPattern)*  
&emsp;&emsp;&emsp;<a name="BindingPattern-xjjvo5sr"></a>*[ArrayBindingPattern](#ArrayBindingPattern)*  
  
&emsp;&emsp;<a name="ObjectBindingPattern"></a>*ObjectBindingPattern* **:**  
&emsp;&emsp;&emsp;<a name="ObjectBindingPattern-gbpaspne"></a>`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ObjectBindingPattern-9burfd4m"></a>`` { ``&emsp;*[BindingPropertyList](#BindingPropertyList)*&emsp;`` , ``<sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="BindingPropertyList"></a>*BindingPropertyList* **:**  
&emsp;&emsp;&emsp;<a name="BindingPropertyList-y9z6szrc"></a>*[BindingProperty](#BindingProperty)*  
&emsp;&emsp;&emsp;<a name="BindingPropertyList-bzdeo9zt"></a>*[BindingPropertyList](#BindingPropertyList)*&emsp;`` , ``&emsp;*[BindingProperty](#BindingProperty)*  
  
&emsp;&emsp;<a name="BindingProperty"></a>*BindingProperty* **:**  
&emsp;&emsp;&emsp;<a name="BindingProperty-awwzbvo6"></a>*[Identifier](#Identifier)*&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="BindingProperty-eodzirno"></a>*[PropertyName](#PropertyName)*&emsp;`` : ``&emsp;*[Identifier](#Identifier)*&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="BindingProperty-hb-zmwe0"></a>*[PropertyName](#PropertyName)*&emsp;`` : ``&emsp;*[BindingPattern](#BindingPattern)*&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ArrayBindingPattern"></a>*ArrayBindingPattern* **:**  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-njmfo-uj"></a>`` [ ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingRestElement](#BindingRestElement)*<sub>opt</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-hqlkkwfb"></a>`` [ ``&emsp;*[BindingElementList](#BindingElementList)*&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-12yahkzg"></a>`` [ ``&emsp;*[BindingElementList](#BindingElementList)*&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingRestElement](#BindingRestElement)*<sub>opt</sub>&emsp;`` ] ``  
  
&emsp;&emsp;<a name="BindingElementList"></a>*BindingElementList* **:**  
&emsp;&emsp;&emsp;<a name="BindingElementList-wo9nasvo"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingElement](#BindingElement)*  
&emsp;&emsp;&emsp;<a name="BindingElementList-thmwgdrs"></a>*[BindingElementList](#BindingElementList)*&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingElement](#BindingElement)*  
  
&emsp;&emsp;<a name="BindingElement"></a>*BindingElement* **:**  
&emsp;&emsp;&emsp;<a name="BindingElement-awwzbvo6"></a>*[Identifier](#Identifier)*&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="BindingElement-ahx6lm0w"></a>*[BindingPattern](#BindingPattern)*&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="BindingRestElement"></a>*BindingRestElement* **:**  
&emsp;&emsp;&emsp;<a name="BindingRestElement-uh6b21ad"></a>`` ... ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="FunctionDeclaration"></a>*FunctionDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="FunctionDeclaration-n7yeneda"></a>*[FunctionOverloads](#FunctionOverloads)*<sub>opt</sub>&emsp;*[FunctionImplementation](#FunctionImplementation)*  
  
&emsp;&emsp;<a name="FunctionOverloads"></a>*FunctionOverloads* **:**  
&emsp;&emsp;&emsp;<a name="FunctionOverloads-cmydxssp"></a>*[FunctionOverload](#FunctionOverload)*  
&emsp;&emsp;&emsp;<a name="FunctionOverloads-mga38ka3"></a>*[FunctionOverloads](#FunctionOverloads)*&emsp;*[FunctionOverload](#FunctionOverload)*  
  
&emsp;&emsp;<a name="FunctionOverload"></a>*FunctionOverload* **:**  
&emsp;&emsp;&emsp;<a name="FunctionOverload-3qxk_g19"></a>`` function ``&emsp;*[Identifier](#Identifier)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="FunctionImplementation"></a>*FunctionImplementation* **:**  
&emsp;&emsp;&emsp;<a name="FunctionImplementation-rpmps0ei"></a>`` function ``&emsp;*[Identifier](#Identifier)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="InterfaceDeclaration"></a>*InterfaceDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="InterfaceDeclaration-hny0rztr"></a>`` interface ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;*[InterfaceExtendsClause](#InterfaceExtendsClause)*<sub>opt</sub>&emsp;*[ObjectType](#ObjectType)*  
  
&emsp;&emsp;<a name="InterfaceExtendsClause"></a>*InterfaceExtendsClause* **:**  
&emsp;&emsp;&emsp;<a name="InterfaceExtendsClause-x6zvsb3x"></a>`` extends ``&emsp;*[ClassOrInterfaceTypeList](#ClassOrInterfaceTypeList)*  
  
&emsp;&emsp;<a name="ClassOrInterfaceTypeList"></a>*ClassOrInterfaceTypeList* **:**  
&emsp;&emsp;&emsp;<a name="ClassOrInterfaceTypeList-ytcacayl"></a>*[ClassOrInterfaceType](#ClassOrInterfaceType)*  
&emsp;&emsp;&emsp;<a name="ClassOrInterfaceTypeList-npdbozgp"></a>*[ClassOrInterfaceTypeList](#ClassOrInterfaceTypeList)*&emsp;`` , ``&emsp;*[ClassOrInterfaceType](#ClassOrInterfaceType)*  
  
&emsp;&emsp;<a name="ClassOrInterfaceType"></a>*ClassOrInterfaceType* **:**  
&emsp;&emsp;&emsp;<a name="ClassOrInterfaceType-doi8ufqr"></a>*[TypeReference](#TypeReference)*  
  
&emsp;&emsp;<a name="ClassDeclaration"></a>*ClassDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ClassDeclaration-fvczqnww"></a>`` class ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;*[ClassHeritage](#ClassHeritage)*&emsp;`` { ``&emsp;*[ClassBody](#ClassBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="ClassHeritage"></a>*ClassHeritage* **:**  
&emsp;&emsp;&emsp;<a name="ClassHeritage-jpdgfy-r"></a>*[ClassExtendsClause](#ClassExtendsClause)*<sub>opt</sub>&emsp;*[ImplementsClause](#ImplementsClause)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ClassExtendsClause"></a>*ClassExtendsClause* **:**  
&emsp;&emsp;&emsp;<a name="ClassExtendsClause--d0n-3ed"></a>`` extends ``&emsp;*[ClassType](#ClassType)*  
  
&emsp;&emsp;<a name="ClassType"></a>*ClassType* **:**  
&emsp;&emsp;&emsp;<a name="ClassType-doi8ufqr"></a>*[TypeReference](#TypeReference)*  
  
&emsp;&emsp;<a name="ImplementsClause"></a>*ImplementsClause* **:**  
&emsp;&emsp;&emsp;<a name="ImplementsClause-kgrttw9s"></a>`` implements ``&emsp;*[ClassOrInterfaceTypeList](#ClassOrInterfaceTypeList)*  
  
&emsp;&emsp;<a name="ClassBody"></a>*ClassBody* **:**  
&emsp;&emsp;&emsp;<a name="ClassBody-ufkbs7vl"></a>*[ClassElements](#ClassElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ClassElements"></a>*ClassElements* **:**  
&emsp;&emsp;&emsp;<a name="ClassElements-crvluhmw"></a>*[ClassElement](#ClassElement)*  
&emsp;&emsp;&emsp;<a name="ClassElements-ek4rl3pg"></a>*[ClassElements](#ClassElements)*&emsp;*[ClassElement](#ClassElement)*  
  
&emsp;&emsp;<a name="ClassElement"></a>*ClassElement* **:**  
&emsp;&emsp;&emsp;<a name="ClassElement-dzswpehn"></a>*[ConstructorDeclaration](#ConstructorDeclaration)*  
&emsp;&emsp;&emsp;<a name="ClassElement-mis_-wir"></a>*[PropertyMemberDeclaration](#PropertyMemberDeclaration)*  
&emsp;&emsp;&emsp;<a name="ClassElement-kpoicuyg"></a>*[IndexMemberDeclaration](#IndexMemberDeclaration)*  
  
&emsp;&emsp;<a name="ConstructorDeclaration"></a>*ConstructorDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ConstructorDeclaration-melimqlq"></a>*[ConstructorOverloads](#ConstructorOverloads)*<sub>opt</sub>&emsp;*[ConstructorImplementation](#ConstructorImplementation)*  
  
&emsp;&emsp;<a name="ConstructorOverloads"></a>*ConstructorOverloads* **:**  
&emsp;&emsp;&emsp;<a name="ConstructorOverloads-qayxfiml"></a>*[ConstructorOverload](#ConstructorOverload)*  
&emsp;&emsp;&emsp;<a name="ConstructorOverloads-lbvwa4hm"></a>*[ConstructorOverloads](#ConstructorOverloads)*&emsp;*[ConstructorOverload](#ConstructorOverload)*  
  
&emsp;&emsp;<a name="ConstructorOverload"></a>*ConstructorOverload* **:**  
&emsp;&emsp;&emsp;<a name="ConstructorOverload-_og_fdcq"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` constructor ``&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` ; ``  
  
&emsp;&emsp;<a name="ConstructorImplementation"></a>*ConstructorImplementation* **:**  
&emsp;&emsp;&emsp;<a name="ConstructorImplementation-nk_vxhcb"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` constructor ``&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="PropertyMemberDeclaration"></a>*PropertyMemberDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="PropertyMemberDeclaration-nfwmg3az"></a>*[MemberVariableDeclaration](#MemberVariableDeclaration)*  
&emsp;&emsp;&emsp;<a name="PropertyMemberDeclaration-5b2kicva"></a>*[MemberFunctionDeclaration](#MemberFunctionDeclaration)*  
&emsp;&emsp;&emsp;<a name="PropertyMemberDeclaration-m40vh366"></a>*[MemberAccessorDeclaration](#MemberAccessorDeclaration)*  
  
&emsp;&emsp;<a name="MemberVariableDeclaration"></a>*MemberVariableDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="MemberVariableDeclaration-y_0v7ssd"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[PropertyName](#PropertyName)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;*[Initializer](#Initializer)*<sub>opt</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="MemberFunctionDeclaration"></a>*MemberFunctionDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="MemberFunctionDeclaration-2ft9quia"></a>*[MemberFunctionOverloads](#MemberFunctionOverloads)*<sub>opt</sub>&emsp;*[MemberFunctionImplementation](#MemberFunctionImplementation)*  
  
&emsp;&emsp;<a name="MemberFunctionOverloads"></a>*MemberFunctionOverloads* **:**  
&emsp;&emsp;&emsp;<a name="MemberFunctionOverloads-usdwubo6"></a>*[MemberFunctionOverload](#MemberFunctionOverload)*  
&emsp;&emsp;&emsp;<a name="MemberFunctionOverloads-w1s5e3lu"></a>*[MemberFunctionOverloads](#MemberFunctionOverloads)*&emsp;*[MemberFunctionOverload](#MemberFunctionOverload)*  
  
&emsp;&emsp;<a name="MemberFunctionOverload"></a>*MemberFunctionOverload* **:**  
&emsp;&emsp;&emsp;<a name="MemberFunctionOverload-a4ylh_ue"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[PropertyName](#PropertyName)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="MemberFunctionImplementation"></a>*MemberFunctionImplementation* **:**  
&emsp;&emsp;&emsp;<a name="MemberFunctionImplementation-jpqbawvv"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[PropertyName](#PropertyName)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="MemberAccessorDeclaration"></a>*MemberAccessorDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="MemberAccessorDeclaration-opxvhvua"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[GetAccessor](#GetAccessor)*  
&emsp;&emsp;&emsp;<a name="MemberAccessorDeclaration-u-rsfco7"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[SetAccessor](#SetAccessor)*  
  
&emsp;&emsp;<a name="IndexMemberDeclaration"></a>*IndexMemberDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="IndexMemberDeclaration-umku_mjx"></a>*[IndexSignature](#IndexSignature)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="EnumDeclaration"></a>*EnumDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="EnumDeclaration-pwwgqinb"></a>`` const ``<sub>opt</sub>&emsp;`` enum ``&emsp;*[Identifier](#Identifier)*&emsp;`` { ``&emsp;*[EnumBody](#EnumBody)*<sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="EnumBody"></a>*EnumBody* **:**  
&emsp;&emsp;&emsp;<a name="EnumBody-ag--srfg"></a>*[EnumMemberList](#EnumMemberList)*&emsp;`` , ``<sub>opt</sub>  
  
&emsp;&emsp;<a name="EnumMemberList"></a>*EnumMemberList* **:**  
&emsp;&emsp;&emsp;<a name="EnumMemberList-vflanevg"></a>*[EnumMember](#EnumMember)*  
&emsp;&emsp;&emsp;<a name="EnumMemberList-7dn-cbj2"></a>*[EnumMemberList](#EnumMemberList)*&emsp;`` , ``&emsp;*[EnumMember](#EnumMember)*  
  
&emsp;&emsp;<a name="EnumMember"></a>*EnumMember* **:**  
&emsp;&emsp;&emsp;<a name="EnumMember-bmyo-0oj"></a>*[PropertyName](#PropertyName)*  
&emsp;&emsp;&emsp;<a name="EnumMember-6gocubkc"></a>*[PropertyName](#PropertyName)*&emsp;`` = ``&emsp;*[EnumValue](#EnumValue)*  
  
&emsp;&emsp;<a name="EnumValue"></a>*EnumValue* **:**  
&emsp;&emsp;&emsp;<a name="EnumValue-1px9pijq"></a>*[AssignmentExpression](#AssignmentExpression)*  
  
&emsp;&emsp;<a name="ModuleDeclaration"></a>*ModuleDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ModuleDeclaration-db2ni7tz"></a>`` module ``&emsp;*[IdentifierPath](#IdentifierPath)*&emsp;`` { ``&emsp;*[ModuleBody](#ModuleBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="IdentifierPath"></a>*IdentifierPath* **:**  
&emsp;&emsp;&emsp;<a name="IdentifierPath-bras6mo_"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="IdentifierPath-o7g18onm"></a>*[IdentifierPath](#IdentifierPath)*&emsp;`` . ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="ModuleBody"></a>*ModuleBody* **:**  
&emsp;&emsp;&emsp;<a name="ModuleBody-_stcdqr6"></a>*[ModuleElements](#ModuleElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ModuleElements"></a>*ModuleElements* **:**  
&emsp;&emsp;&emsp;<a name="ModuleElements-jrm5c4cf"></a>*[ModuleElement](#ModuleElement)*  
&emsp;&emsp;&emsp;<a name="ModuleElements-jos3nsgd"></a>*[ModuleElements](#ModuleElements)*&emsp;*[ModuleElement](#ModuleElement)*  
  
&emsp;&emsp;<a name="ModuleElement"></a>*ModuleElement* **:**  
&emsp;&emsp;&emsp;<a name="ModuleElement-pyyivtxj"></a>*[Statement](#Statement)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-nlczkewv"></a>`` export ``<sub>opt</sub>&emsp;*[VariableDeclaration](#VariableDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-ar5jirbw"></a>`` export ``<sub>opt</sub>&emsp;*[FunctionDeclaration](#FunctionDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-qbesia14"></a>`` export ``<sub>opt</sub>&emsp;*[ClassDeclaration](#ClassDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement--k--7r0l"></a>`` export ``<sub>opt</sub>&emsp;*[InterfaceDeclaration](#InterfaceDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-nnyrh157"></a>`` export ``<sub>opt</sub>&emsp;*[TypeAliasDeclaration](#TypeAliasDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-odgept8g"></a>`` export ``<sub>opt</sub>&emsp;*[EnumDeclaration](#EnumDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement--mno8x78"></a>`` export ``<sub>opt</sub>&emsp;*[ModuleDeclaration](#ModuleDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-1f4lnqhq"></a>`` export ``<sub>opt</sub>&emsp;*[ImportDeclaration](#ImportDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-6upn92k-"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientDeclaration](#AmbientDeclaration)*  
  
&emsp;&emsp;<a name="ImportDeclaration"></a>*ImportDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ImportDeclaration-gqb3jmdp"></a>`` import ``&emsp;*[Identifier](#Identifier)*&emsp;`` = ``&emsp;*[EntityName](#EntityName)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="EntityName"></a>*EntityName* **:**  
&emsp;&emsp;&emsp;<a name="EntityName-gpsai0a5"></a>*[ModuleName](#ModuleName)*  
&emsp;&emsp;&emsp;<a name="EntityName-wn3huwdx"></a>*[ModuleName](#ModuleName)*&emsp;`` . ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="SourceFile"></a>*SourceFile* **:**  
&emsp;&emsp;&emsp;<a name="SourceFile-su0fqms-"></a>*[ImplementationSourceFile](#ImplementationSourceFile)*  
&emsp;&emsp;&emsp;<a name="SourceFile-8viv6bb6"></a>*[DeclarationSourceFile](#DeclarationSourceFile)*  
  
&emsp;&emsp;<a name="ImplementationSourceFile"></a>*ImplementationSourceFile* **:**  
&emsp;&emsp;&emsp;<a name="ImplementationSourceFile-yyycdxjh"></a>*[ImplementationElements](#ImplementationElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ImplementationElements"></a>*ImplementationElements* **:**  
&emsp;&emsp;&emsp;<a name="ImplementationElements-2aft0izw"></a>*[ImplementationElement](#ImplementationElement)*  
&emsp;&emsp;&emsp;<a name="ImplementationElements-mzjyjy1n"></a>*[ImplementationElements](#ImplementationElements)*&emsp;*[ImplementationElement](#ImplementationElement)*  
  
&emsp;&emsp;<a name="ImplementationElement"></a>*ImplementationElement* **:**  
&emsp;&emsp;&emsp;<a name="ImplementationElement-jrm5c4cf"></a>*[ModuleElement](#ModuleElement)*  
&emsp;&emsp;&emsp;<a name="ImplementationElement-0mkkoxiy"></a>*[ExportAssignment](#ExportAssignment)*  
&emsp;&emsp;&emsp;<a name="ImplementationElement-4kejllqk"></a>*[AmbientExternalModuleDeclaration](#AmbientExternalModuleDeclaration)*  
&emsp;&emsp;&emsp;<a name="ImplementationElement-okxfvgkp"></a>`` export ``<sub>opt</sub>&emsp;*[ExternalImportDeclaration](#ExternalImportDeclaration)*  
  
&emsp;&emsp;<a name="DeclarationSourceFile"></a>*DeclarationSourceFile* **:**  
&emsp;&emsp;&emsp;<a name="DeclarationSourceFile-occ_5si8"></a>*[DeclarationElements](#DeclarationElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="DeclarationElements"></a>*DeclarationElements* **:**  
&emsp;&emsp;&emsp;<a name="DeclarationElements-llwgpurx"></a>*[DeclarationElement](#DeclarationElement)*  
&emsp;&emsp;&emsp;<a name="DeclarationElements-xlnktcwb"></a>*[DeclarationElements](#DeclarationElements)*&emsp;*[DeclarationElement](#DeclarationElement)*  
  
&emsp;&emsp;<a name="DeclarationElement"></a>*DeclarationElement* **:**  
&emsp;&emsp;&emsp;<a name="DeclarationElement-0mkkoxiy"></a>*[ExportAssignment](#ExportAssignment)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement-4kejllqk"></a>*[AmbientExternalModuleDeclaration](#AmbientExternalModuleDeclaration)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement--k--7r0l"></a>`` export ``<sub>opt</sub>&emsp;*[InterfaceDeclaration](#InterfaceDeclaration)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement-nnyrh157"></a>`` export ``<sub>opt</sub>&emsp;*[TypeAliasDeclaration](#TypeAliasDeclaration)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement-1f4lnqhq"></a>`` export ``<sub>opt</sub>&emsp;*[ImportDeclaration](#ImportDeclaration)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement-6upn92k-"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientDeclaration](#AmbientDeclaration)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement-okxfvgkp"></a>`` export ``<sub>opt</sub>&emsp;*[ExternalImportDeclaration](#ExternalImportDeclaration)*  
  
&emsp;&emsp;<a name="ExternalImportDeclaration"></a>*ExternalImportDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ExternalImportDeclaration-z374yy5f"></a>`` import ``&emsp;*[Identifier](#Identifier)*&emsp;`` = ``&emsp;*[ExternalModuleReference](#ExternalModuleReference)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="ExternalModuleReference"></a>*ExternalModuleReference* **:**  
&emsp;&emsp;&emsp;<a name="ExternalModuleReference-ugyn_gf6"></a>`` require ``&emsp;`` ( ``&emsp;*[StringLiteral](#StringLiteral)*&emsp;`` ) ``  
  
&emsp;&emsp;<a name="ExportAssignment"></a>*ExportAssignment* **:**  
&emsp;&emsp;&emsp;<a name="ExportAssignment-2thkdba-"></a>`` export ``&emsp;`` = ``&emsp;*[Identifier](#Identifier)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="AmbientDeclaration"></a>*AmbientDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientDeclaration-y5qxsakb"></a>`` declare ``&emsp;*[AmbientVariableDeclaration](#AmbientVariableDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientDeclaration-owqe13au"></a>`` declare ``&emsp;*[AmbientFunctionDeclaration](#AmbientFunctionDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientDeclaration-s4kkj8tr"></a>`` declare ``&emsp;*[AmbientClassDeclaration](#AmbientClassDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientDeclaration-nnr0wvyu"></a>`` declare ``&emsp;*[AmbientEnumDeclaration](#AmbientEnumDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientDeclaration-vk4nklar"></a>`` declare ``&emsp;*[AmbientModuleDeclaration](#AmbientModuleDeclaration)*  
  
&emsp;&emsp;<a name="AmbientVariableDeclaration"></a>*AmbientVariableDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientVariableDeclaration-69ybhf6j"></a>`` var ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="AmbientFunctionDeclaration"></a>*AmbientFunctionDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientFunctionDeclaration-3qxk_g19"></a>`` function ``&emsp;*[Identifier](#Identifier)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="AmbientClassDeclaration"></a>*AmbientClassDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientClassDeclaration-kyh5rptv"></a>`` class ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;*[ClassHeritage](#ClassHeritage)*&emsp;`` { ``&emsp;*[AmbientClassBody](#AmbientClassBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="AmbientClassBody"></a>*AmbientClassBody* **:**  
&emsp;&emsp;&emsp;<a name="AmbientClassBody-oyihclya"></a>*[AmbientClassBodyElements](#AmbientClassBodyElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="AmbientClassBodyElements"></a>*AmbientClassBodyElements* **:**  
&emsp;&emsp;&emsp;<a name="AmbientClassBodyElements-4xb2e1uz"></a>*[AmbientClassBodyElement](#AmbientClassBodyElement)*  
&emsp;&emsp;&emsp;<a name="AmbientClassBodyElements-f1gpckz5"></a>*[AmbientClassBodyElements](#AmbientClassBodyElements)*&emsp;*[AmbientClassBodyElement](#AmbientClassBodyElement)*  
  
&emsp;&emsp;<a name="AmbientClassBodyElement"></a>*AmbientClassBodyElement* **:**  
&emsp;&emsp;&emsp;<a name="AmbientClassBodyElement-68ovtg9y"></a>*[AmbientConstructorDeclaration](#AmbientConstructorDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientClassBodyElement-cr1upjeq"></a>*[AmbientPropertyMemberDeclaration](#AmbientPropertyMemberDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientClassBodyElement-dda1seh7"></a>*[IndexSignature](#IndexSignature)*  
  
&emsp;&emsp;<a name="AmbientConstructorDeclaration"></a>*AmbientConstructorDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientConstructorDeclaration-vdpglfl6"></a>`` constructor ``&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` ; ``  
  
&emsp;&emsp;<a name="AmbientPropertyMemberDeclaration"></a>*AmbientPropertyMemberDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientPropertyMemberDeclaration-4ilplaij"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[PropertyName](#PropertyName)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="AmbientPropertyMemberDeclaration-a4ylh_ue"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[PropertyName](#PropertyName)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="AmbientEnumDeclaration"></a>*AmbientEnumDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientEnumDeclaration--ocjwa3k"></a>*[EnumDeclaration](#EnumDeclaration)*  
  
&emsp;&emsp;<a name="AmbientModuleDeclaration"></a>*AmbientModuleDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientModuleDeclaration-6s_fq5ws"></a>`` module ``&emsp;*[IdentifierPath](#IdentifierPath)*&emsp;`` { ``&emsp;*[AmbientModuleBody](#AmbientModuleBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="AmbientModuleBody"></a>*AmbientModuleBody* **:**  
&emsp;&emsp;&emsp;<a name="AmbientModuleBody-azm8kn7b"></a>*[AmbientModuleElements](#AmbientModuleElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="AmbientModuleElements"></a>*AmbientModuleElements* **:**  
&emsp;&emsp;&emsp;<a name="AmbientModuleElements-auuufy4m"></a>*[AmbientModuleElement](#AmbientModuleElement)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElements-9lutfi50"></a>*[AmbientModuleElements](#AmbientModuleElements)*&emsp;*[AmbientModuleElement](#AmbientModuleElement)*  
  
&emsp;&emsp;<a name="AmbientModuleElement"></a>*AmbientModuleElement* **:**  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-vfwfuuov"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientVariableDeclaration](#AmbientVariableDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-tmcfbubz"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientFunctionDeclaration](#AmbientFunctionDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-vnfafwbm"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientClassDeclaration](#AmbientClassDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement--k--7r0l"></a>`` export ``<sub>opt</sub>&emsp;*[InterfaceDeclaration](#InterfaceDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-drq_p9kf"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientEnumDeclaration](#AmbientEnumDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-rcmtgekv"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientModuleDeclaration](#AmbientModuleDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-1f4lnqhq"></a>`` export ``<sub>opt</sub>&emsp;*[ImportDeclaration](#ImportDeclaration)*  
  
&emsp;&emsp;<a name="AmbientExternalModuleDeclaration"></a>*AmbientExternalModuleDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleDeclaration-cys6vwrc"></a>`` declare ``&emsp;`` module ``&emsp;*[StringLiteral](#StringLiteral)*&emsp;`` { ``&emsp;*[AmbientExternalModuleBody](#AmbientExternalModuleBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="AmbientExternalModuleBody"></a>*AmbientExternalModuleBody* **:**  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleBody-oujdvssk"></a>*[AmbientExternalModuleElements](#AmbientExternalModuleElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="AmbientExternalModuleElements"></a>*AmbientExternalModuleElements* **:**  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleElements-eqiwv5el"></a>*[AmbientExternalModuleElement](#AmbientExternalModuleElement)*  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleElements-6xtopriw"></a>*[AmbientExternalModuleElements](#AmbientExternalModuleElements)*&emsp;*[AmbientExternalModuleElement](#AmbientExternalModuleElement)*  
  
&emsp;&emsp;<a name="AmbientExternalModuleElement"></a>*AmbientExternalModuleElement* **:**  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleElement-auuufy4m"></a>*[AmbientModuleElement](#AmbientModuleElement)*  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleElement-0mkkoxiy"></a>*[ExportAssignment](#ExportAssignment)*  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleElement-okxfvgkp"></a>`` export ``<sub>opt</sub>&emsp;*[ExternalImportDeclaration](#ExternalImportDeclaration)*  
  
