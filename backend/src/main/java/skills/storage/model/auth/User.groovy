package skills.storage.model.auth


import groovy.transform.ToString
import skills.storage.model.Setting

import javax.persistence.*

@ToString(excludes = ['roles'])
@Entity
@Table(name = 'users')
class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id

    String userId

    // optional, not used during PKI authentication
    String password

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval=true)
    @JoinColumn(name="userRefId", nullable = false)
    List<UserRole> roles = []
}
